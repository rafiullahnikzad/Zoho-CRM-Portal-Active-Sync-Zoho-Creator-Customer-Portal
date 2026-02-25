/**
 * ============================================================
 * FUNCTION: update_Portal_active_creator
 * LOCATION: Zoho CRM → Setup → Functions
 * TRIGGER:  Workflow Rule on Contacts module
 *           when Portal_Active field is changed (true OR false)
 *
 * PURPOSE:
 *   - Syncs the Portal_Active flag from CRM Contact to Zoho Creator
 *   - If Portal_Active = true  → Updates Creator record + sends portal invite
 *   - If Portal_Active = false → Updates Creator record + removes portal access
 *
 * AUTHOR:   Rafiullah Nikzad
 * GITHUB:   https://github.com/rafiullahnikzad
 * ============================================================
 */

void automation.update_Portal_active_creator(Int contact_id)
{
    // ============================================================
    // STEP 1: Fetch Contact record from Zoho CRM
    // ============================================================
    Get_contact = zoho.crm.getRecordById("Contacts", contact_id);
    info "Get_contact -------->" + Get_contact;

    // Re-extract the contact_id from the fetched record (ensures correct type)
    contact_id = Get_contact.get("id");

    // Extract email and portal_active for use throughout the script
    email = ifnull(Get_contact.get("Email"), "");
    portal_active = ifnull(Get_contact.get("Portal_Active"), false);

    // ============================================================
    // STEP 2: Build full contact map with all CRM fields
    // (Used for creating new records in Creator)
    // ============================================================
    Con_map = Map();
    Con_map.put("Contact_Id", contact_id);                                          // CRM Contact ID reference
    Con_map.put("Name", {"first_name":ifnull(Get_contact.get("First_Name"),""), "last_name":Get_contact.get("Last_Name")});
    Con_map.put("Email", email);                                                     // Email address
    Con_map.put("Phone", ifnull(Get_contact.get("Phone"), ""));                     // Phone number
    Con_map.put("Lead_Source", ifnull(Get_contact.get("Lead_Source"), ""));         // Lead source
    Con_map.put("Job_Title", ifnull(Get_contact.get("Job_Title"), ""));             // Job title
    Con_map.put("Mobile", ifnull(Get_contact.get("Mobile"), ""));                   // Mobile number
    Con_map.put("Department", ifnull(Get_contact.get("Department"), ""));           // Department
    Con_map.put("Description", ifnull(Get_contact.get("Description"), ""));         // Description
    Con_map.put("Portal_active", portal_active);                                    // Portal access flag

    // Build shipping address sub-map
    add_Map = Map();
    add_Map.put("address_line_1", ifnull(Get_contact.get("Shipping_Address"), ""));
    add_Map.put("postal_Code", ifnull(Get_contact.get("Shipping_Zip"), ""));
    add_Map.put("district_city", ifnull(Get_contact.get("Shipping_City"), ""));
    add_Map.put("State_province", ifnull(Get_contact.get("Shipping_State"), ""));
    add_Map.put("Shipping_Country", ifnull(Get_contact.get("Shipping_Country"), ""));
    Con_map.put("Address", add_Map);
    Con_map.put("trigger", "workflow");                                             // Trigger Creator workflows on update

    // ============================================================
    // STEP 3: Link Creator Account if contact has a parent Account
    // ============================================================
    if(Get_contact.get("Account_Name") != null)
    {
        Account_Name = Get_contact.get("Account_Name").get("name");

        // Search for the matching account in Creator report
        filter = "Name == \"" + Account_Name + "\"";
        search_account = zoho.creator.getRecords("bairquality", "project-management", "Contacts_for_Admins", filter, 1, 200, "creator1");

        if(search_account.get("code") == 3000)
        {
            // Account found → link it to this contact record
            account_creator_ID = search_account.get("data").get(0).get("ID");
            Con_map.put("Account_Name", account_creator_ID);
        }
    }

    // ============================================================
    // STEP 4: Search for Contact in Zoho Creator
    // Update if exists, Create if not
    // After update/create → handle portal invite or deletion
    // ============================================================
    filter = "Contact_Id == \"" + contact_id + "\"";
    search_contact = zoho.creator.getRecords("bairquality", "project-management", "All_Customers", filter, 1, 200, "creator1");

    if(search_contact.get("code") == 3000)
    {
        // Contact found in Creator → Update Portal_active flag only
        Creator_ID = search_contact.get("data").get(0).get("ID");
        info "Contact already exists in Zoho Creator ====> Update the Record.    ID = " + Creator_ID;

        otherParams = Map();
        UpdateMap = Map();
        UpdateMap.put("Portal_active", portal_active);                             // Only update the portal flag
        UpdateMap.put("trigger", "workflow");                                       // Fire Creator workflow

        update_record = zoho.creator.updateRecord("bairquality", "project-management", "All_Customers", Creator_ID.toLong(), UpdateMap, otherParams, "creator1");
        info "Record Updated ------>" + update_record;
    }
    else
    {
        // Contact NOT found in Creator → Create full record
        info "Contact NOT exists in Zoho Creator ====> Create the Record in Customers Form";
        option_MAP = Map();
        create_record = zoho.creator.createRecord("bairquality", "project-management", "Customers", Con_map, option_MAP, "creator1");
        info "Record Created ------>" + create_record;
    }
}

// ============================================================
// NOTE: The actual portal invite and delete are handled by
// Creator Workflows (see /creator-workflows/ folder):
//
//   Send_Portal_Invitation_to_Customers.js  → fires when Portal_active == true
//   Delete_Portal_access.js                 → fires when Portal_active == false
//
// Both are triggered automatically via "trigger":"workflow" above
// ============================================================
