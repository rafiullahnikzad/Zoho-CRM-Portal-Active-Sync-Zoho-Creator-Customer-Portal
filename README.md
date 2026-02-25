# 🔐 Zoho CRM Portal Active Sync → Zoho Creator Customer Portal

> **Author:** Rafiullah Nikzad — Senior Zoho Developer @ CloudZ Technologies
> **GitHub:** [github.com/rafiullahnikzad](https://github.com/rafiullahnikzad)
> **Portfolio:** [rafiullahnikzad.netlify.app](https://rafiullahnikzad.netlify.app)
> **LinkedIn Community:** [Zoho Afghanistan](https://www.linkedin.com/groups/) (10,00+ Members)

---

## 📌 Overview

This project automates **Zoho Creator Customer Portal access** directly from **Zoho CRM**.

When a CRM admin checks or unchecks the **Portal Active** checkbox on a Contact:
- ✅ **Checked (true)** → Contact is synced to Creator + Portal invitation email is sent automatically
- ❌ **Unchecked (false)** → Contact's portal access is revoked + Creator record updated

No manual steps needed. One checkbox in CRM controls everything.

---

## ✅ Tested & Working

```
Portal Active = true:
  CRM Contact       → Synced to Creator ✅
  Creator record    → Portal_active = true ✅
  Portal invite     → Sent via thisapp.portal.assignUserInProfile() ✅

Portal Active = false:
  CRM Contact       → Synced to Creator ✅
  Creator record    → Portal_active = false ✅
  Portal access     → Revoked via thisapp.portal.deleteUser() ✅
```

---

## 📁 Project Structure

```
zoho-portal-sync/
│
├── README.md                                        ← This file
│
├── crm-function/
│   └── update_Portal_active_creator.js             ← CRM Deluge Function
│       Triggered by CRM Workflow Rule on Contacts
│       Syncs Portal_Active to Creator
│
└── creator-workflows/
    ├── Send_Portal_Invitation_to_Customers.js      ← Creator Workflow (Portal_active == true)
    │   Sends portal invite via thisapp.portal.assignUserInProfile()
    │
    └── Delete_Portal_access.js                     ← Creator Workflow (Portal_active changed)
        Handles both: invite (true) and delete (false)
        Uses thisapp.portal.deleteUser()
```

---

## 🧩 Use Case

### Who Needs This?

- Businesses giving **selective portal access** to customers through Zoho Creator
- Companies where **CRM is the master system** and portal access is managed by sales/admin
- Teams that need **audit control** — portal access tied to a CRM checkbox with full timeline history
- Developers building **multi-app Zoho ecosystems** where CRM drives all access decisions

### Real-World Scenario

```
CRM Admin opens a Contact record
           │
           ▼
    Checks "Portal Active" ✅
           │
           ▼
  CRM Workflow fires automatically
           │
           ▼
  update_Portal_active_creator() runs
           │
     ┌─────┴─────┐
     ▼           ▼
 Creator      Creator
 record       workflow
 updated      fires
 (true)          │
           ┌─────┴──────┐
           ▼            ▼
      Portal_active   thisapp.portal
      == true         .assignUserInProfile()
                           │
                           ▼
                   📧 Invite email sent
                      to customer ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRM Admin unchecks "Portal Active" ❌
           │
           ▼
  update_Portal_active_creator() runs
           │
     ┌─────┴─────┐
     ▼           ▼
 Creator      Creator
 record       workflow
 updated      fires
 (false)         │
           ┌─────┴──────┐
           ▼            ▼
      Portal_active   thisapp.portal
      == false        .deleteUser()
                           │
                           ▼
                   🚫 Portal access
                      revoked ✅
```

---

## 🔁 Complete Logic Flow

```
START (CRM Portal_Active checkbox changes)
  │
  ▼
[CRM] update_Portal_active_creator() fires
  │
  ▼
Fetch Contact from CRM
  │
  ▼
Build Con_map with all contact fields
  │
  ▼
Has parent Account?
  ├── YES → Search Creator for Account → Link account_creator_ID
  └── NO  → Skip
  │
  ▼
Search Creator for Contact by Contact_Id
  ├── FOUND  → UPDATE UpdateMap (Portal_active + trigger) ✅
  └── NOT FOUND → CREATE full record in Creator ✅
  │
  ▼
Creator receives "trigger":"workflow"
  │
  ▼
Creator Workflow fires based on Portal_active value
  │
  ├── Portal_active == true
  │       ▼
  │   Send_Portal_Invitation workflow
  │       ▼
  │   thisapp.portal.assignUserInProfile(email, "Client")
  │       ▼
  │   📧 Invite email sent to customer ✅
  │
  └── Portal_active == false
          ▼
      Delete_Portal_access workflow
          ▼
      thisapp.portal.deleteUser(email)
          ▼
      🚫 Portal access revoked ✅
  │
  ▼
END
```

---

## 📄 Script 1 — CRM Function

**File:** `crm-function/update_Portal_active_creator.js`
**Location in Zoho:** CRM → Setup → Developer Space → Functions

```javascript
void automation.update_Portal_active_creator(Int contact_id)
{
    // STEP 1: Fetch Contact from CRM
    Get_contact = zoho.crm.getRecordById("Contacts", contact_id);
    info "Get_contact -------->" + Get_contact;
    contact_id = Get_contact.get("id");

    email = ifnull(Get_contact.get("Email"), "");
    portal_active = ifnull(Get_contact.get("Portal_Active"), false);

    // STEP 2: Build full contact map
    Con_map = Map();
    Con_map.put("Contact_Id", contact_id);
    Con_map.put("Name", {"first_name":ifnull(Get_contact.get("First_Name"),""), "last_name":Get_contact.get("Last_Name")});
    Con_map.put("Email", email);
    Con_map.put("Phone", ifnull(Get_contact.get("Phone"), ""));
    Con_map.put("Lead_Source", ifnull(Get_contact.get("Lead_Source"), ""));
    Con_map.put("Job_Title", ifnull(Get_contact.get("Job_Title"), ""));
    Con_map.put("Mobile", ifnull(Get_contact.get("Mobile"), ""));
    Con_map.put("Department", ifnull(Get_contact.get("Department"), ""));
    Con_map.put("Description", ifnull(Get_contact.get("Description"), ""));
    Con_map.put("Portal_active", portal_active);
    add_Map = Map();
    add_Map.put("address_line_1", ifnull(Get_contact.get("Shipping_Address"), ""));
    add_Map.put("postal_Code", ifnull(Get_contact.get("Shipping_Zip"), ""));
    add_Map.put("district_city", ifnull(Get_contact.get("Shipping_City"), ""));
    add_Map.put("State_province", ifnull(Get_contact.get("Shipping_State"), ""));
    add_Map.put("Shipping_Country", ifnull(Get_contact.get("Shipping_Country"), ""));
    Con_map.put("Address", add_Map);
    Con_map.put("trigger", "workflow");

    // STEP 3: Link Creator Account
    if(Get_contact.get("Account_Name") != null)
    {
        Account_Name = Get_contact.get("Account_Name").get("name");
        filter = "Name == \"" + Account_Name + "\"";
        search_account = zoho.creator.getRecords("bairquality", "project-management", "Contacts_for_Admins", filter, 1, 200, "creator1");
        if(search_account.get("code") == 3000)
        {
            account_creator_ID = search_account.get("data").get(0).get("ID");
            Con_map.put("Account_Name", account_creator_ID);
        }
    }

    // STEP 4: Search Creator → Update or Create
    filter = "Contact_Id == \"" + contact_id + "\"";
    search_contact = zoho.creator.getRecords("bairquality", "project-management", "All_Customers", filter, 1, 200, "creator1");

    if(search_contact.get("code") == 3000)
    {
        Creator_ID = search_contact.get("data").get(0).get("ID");
        info "Contact exists in Creator → Updating. ID = " + Creator_ID;
        otherParams = Map();
        UpdateMap = Map();
        UpdateMap.put("Portal_active", portal_active);
        UpdateMap.put("trigger", "workflow");
        update_record = zoho.creator.updateRecord("bairquality", "project-management", "All_Customers", Creator_ID.toLong(), UpdateMap, otherParams, "creator1");
        info "Record Updated ------>" + update_record;
    }
    else
    {
        info "Contact NOT found in Creator → Creating new record";
        option_MAP = Map();
        create_record = zoho.creator.createRecord("bairquality", "project-management", "Customers", Con_map, option_MAP, "creator1");
        info "Record Created ------>" + create_record;
    }
}
```

---

## 📄 Script 2 — Creator Workflow: Send Portal Invitation

**File:** `creator-workflows/Send_Portal_Invitation_to_Customers.js`
**Location in Zoho:** Creator → Customers → Workflow → Edited → Update of Portal active

**Condition:** `Portal_active == true`

```javascript
// Assign user to the "Client" portal profile and send invite email
response = thisapp.portal.assignUserInProfile(input.Email, "Client");
// info "Portal Invite sent ------> " + response;
```

---

## 📄 Script 3 — Creator Workflow: Delete Portal Access

**File:** `creator-workflows/Delete_Portal_access.js`
**Location in Zoho:** Creator → Customers → Workflow → Edited → Update of Portal active

**Condition:** Triggered on Portal_active change (handles both true/false in code)

```javascript
email = input.Email.toString();
portal_active = input.Portal_active.toString();

if(portal_active == "false")
{
    // Remove user from portal
    delete_response = thisapp.portal.deleteUser(email);
    info "Delete response: " + delete_response;
}
else
{
    // Assign user to portal profile
    invite_response = thisapp.permissions.assignUserInProfile(email, "User Contact");
    info "Invite response: " + invite_response;
}
```

---

## ⚙️ Setup Guide

### Step 1 — Prerequisites

| Requirement | Details |
|-------------|---------|
| Zoho CRM | Any paid plan with workflow automation |
| Zoho Creator | App with `All_Customers` report, `Customers` form, `Contacts_for_Admins` report |
| Creator Portal | Customer portal enabled with permissions configured |
| Portal Profile | Profile named `"Client"` or `"User Contact"` created in Creator |

### Step 2 — Enable Creator Customer Portal

1. Go to **Creator app → Settings → Portal**
2. Click **Enable Portal**
3. Create a Permission profile (e.g., `Client` or `User Contact`)
4. Configure which forms/reports the portal user can access

### Step 3 — Create Creator Connection in CRM (`creator1`)

1. Go to **CRM → Setup → Developer Space → Connections**
2. Click **New Connection → Zoho OAuth → Zoho Creator**
3. Required scopes:
```
ZohoCreator.report.READ
ZohoCreator.report.UPDATE
ZohoCreator.form.CREATE
```
4. Name it: `creator1`

### Step 4 — Create CRM Function

1. Go to **CRM → Setup → Developer Space → Functions**
2. Click **New Function**
3. Set:
   - Function Name: `update_Portal_active_creator`
   - Argument: `contact_id` (Int)
4. Paste the code from `crm-function/update_Portal_active_creator.js`
5. Replace placeholders (see table below)

### Step 5 — Update Script Placeholders

| Placeholder | Replace With | Where to Find |
|-------------|-------------|---------------|
| `"bairquality"` | Your Creator owner username | Creator URL |
| `"project-management"` | Your Creator app link name | Creator URL |
| `"All_Customers"` | Your Creator customers report name | Creator app |
| `"Customers"` | Your Creator customers form name | Creator app |
| `"Contacts_for_Admins"` | Your Creator accounts report name | Creator app |
| `"Client"` | Your Creator portal profile name | Creator → Settings → Portal |

### Step 6 — Create CRM Workflow Rule

1. Go to **CRM → Setup → Automation → Workflow Rules → New Rule**

| Setting | Value |
|---------|-------|
| Module | Contacts |
| Rule Name | `Update_portal_active` |
| Trigger | Field Update → `Portal_Active` |
| Run | Every time field is modified |
| Action | Function → `update_Portal_active_creator` |

### Step 7 — Create Creator Workflows

#### Workflow A: Send Portal Invitation
1. Go to **Creator app → Workflow → New Workflow**
2. Form: `Customers`
3. Trigger: `Edited → Update of Portal active`
4. Condition: `Portal_active == true`
5. Action: Deluge Script → paste `Send_Portal_Invitation_to_Customers.js`

#### Workflow B: Delete Portal Access
1. Go to **Creator app → Workflow → New Workflow**
2. Form: `Customers`
3. Trigger: `Edited → Update of Portal active`
4. Condition: *(none — handled in code)*
5. Action: Deluge Script → paste `Delete_Portal_access.js`

---

## 🔑 Deluge Functions & APIs Used

### CRM Function

| Function | Purpose | Official Docs |
|----------|---------|---------------|
| `zoho.crm.getRecordById()` | Fetch Contact from CRM | [📖 Docs](https://www.zoho.com/deluge/help/zoho-services/crm/get-record.html) |
| `zoho.creator.getRecords()` | Search Creator records | [📖 Docs](https://www.zoho.com/deluge/help/zoho-services/creator/get-records.html) |
| `zoho.creator.updateRecord()` | Update Creator record | [📖 Docs](https://www.zoho.com/deluge/help/zoho-services/creator/update-record.html) |
| `zoho.creator.createRecord()` | Create Creator record | [📖 Docs](https://www.zoho.com/deluge/help/zoho-services/creator/add-record.html) |
| `ifnull()` | Null-safe value retrieval | [📖 Docs](https://www.zoho.com/deluge/help/built-in-functions/ifnull.html) |
| `Map()` | Key-value data structure | [📖 Docs](https://www.zoho.com/deluge/help/datatypes/map.html) |

### Creator Workflow Functions

| Function | Purpose | Official Docs |
|----------|---------|---------------|
| `thisapp.portal.assignUserInProfile()` | Add user to portal profile + send invite | [📖 Docs](https://www.zoho.com/deluge/help/misc-statements/assign-permission-portal-user.html) |
| `thisapp.portal.deleteUser()` | Remove user from customer portal | [📖 Docs](https://www.zoho.com/deluge/help/misc-statements/delete-user-portal.html) |
| `thisapp.permissions.assignUserInProfile()` | Add user to app permission profile | [📖 Docs](https://www.zoho.com/deluge/help/misc-statements/assign-permission-user.html) |

> ⚠️ **Critical:** `thisapp.portal.deleteUser()` and `thisapp.portal.assignUserInProfile()` only work **inside Zoho Creator**. They cannot be called from CRM functions. This is why the portal logic lives in Creator workflows, not in the CRM function.

---

## 🔄 Creator Workflow Configuration Screenshots

### Workflows Overview
```
Customers form → Edited → Update of Portal active
├── Send Portal Invitation to Customers   [Enabled] ✅
│   Condition: Portal_active == true
│   Action: thisapp.portal.assignUserInProfile(input.Email, "Client")
│
└── Delete Portal access                  [Enabled] ✅
    Condition: (none - handled in script)
    Action: if false → deleteUser() | if true → assignUserInProfile()
```

---

## ⚠️ Common Errors & Solutions

| Error | Root Cause | Solution |
|-------|-----------|----------|
| Portal invite not sending | `thisapp.portal.deleteUser()` called from CRM | Move portal logic to Creator workflow ✅ |
| `UpdateMap` not being used | Passing `Con_map` instead of `UpdateMap` to updateRecord | Use `UpdateMap` in the update call ✅ |
| User not removed from portal | `deleteUser()` called from CRM (not supported) | Use Creator workflow for deletion ✅ |
| `portal_active` value mismatch | Boolean vs string comparison | Use `.toString()` and compare `== "false"` in Creator ✅ |
| Portal invite sent but user can't log in | Portal profile name mismatch | Verify profile name matches exactly in Creator Portal settings |
| Creator workflow not firing | `trigger:"workflow"` missing from UpdateMap | Always include `UpdateMap.put("trigger","workflow")` ✅ |

---

## 📊 Workflow Execution Matrix

| CRM Action | Creator Update | Creator Workflow | Portal Result |
|------------|---------------|-----------------|---------------|
| Portal_Active = true (new contact) | Creates record | Send Portal Invitation fires | 📧 Invite sent ✅ |
| Portal_Active = true (existing) | Updates Portal_active=true | Send Portal Invitation fires | 📧 Invite sent ✅ |
| Portal_Active = false (existing) | Updates Portal_active=false | Delete Portal access fires | 🚫 Access revoked ✅ |
| Portal_Active = false (new contact) | Creates record | Delete Portal access fires | 🚫 No access granted ✅ |

---

## 🔗 Related Scripts in This Collection

This is **Part 3** of a complete CRM → Creator → Books sync system:

| # | Script | Purpose |
|---|--------|---------|
| 1 | [`Create_account_in_Creator`](../01-Create_account_in_Creator/) | Sync CRM Account → Creator + Books |
| 2 | [`Create_contact_in_creator`](../02-Create_contact_in_creator/) | Sync CRM Contact → Creator + Books Contact Person |
| 3 | `update_Portal_active_creator` ← **You are here** | Portal invite and revocation |

---

## 💡 Key Technical Notes

**Why portal logic must live in Creator (not CRM):**
`thisapp.portal.deleteUser()` and `thisapp.portal.assignUserInProfile()` are Creator-specific Deluge tasks. They reference `thisapp` which is only available in the context of a Creator app. Calling them from a CRM function will throw an error.

**Why `trigger:"workflow"` is critical:**
Without this flag in the UpdateMap, Creator won't fire its own workflows after the record is updated via the API. Always include it when you want Creator workflows to chain after a CRM-initiated update.

**Why `portal_active.toString() == "false"` in Creator:**
Creator workflow scripts receive field values as strings, not booleans. Comparing `portal_active == false` (boolean) will fail. Always use `.toString()` and compare as a string.

---

## 📚 Additional Resources

| Resource | Link |
|----------|------|
| Zoho Deluge Help Center | [zoho.com/deluge/help](https://www.zoho.com/deluge/help/) |
| Delete Portal User | [zoho.com/deluge/help/misc-statements/delete-user-portal](https://www.zoho.com/deluge/help/misc-statements/delete-user-portal.html) |
| Assign Portal User Profile | [zoho.com/deluge/help/misc-statements/assign-permission-portal-user](https://www.zoho.com/deluge/help/misc-statements/assign-permission-portal-user.html) |
| Assign App User Profile | [zoho.com/deluge/help/misc-statements/assign-permission-user](https://www.zoho.com/deluge/help/misc-statements/assign-permission-user.html) |
| Creator Portal Setup | [zoho.com/creator/help/portal](https://www.zoho.com/creator/help/portal/understanding-portal.html) |
| Creator Workflow Docs | [zoho.com/creator/help/workflows](https://www.zoho.com/creator/help/workflow/understanding-workflow.html) |
| Zoho CRM Workflow Rules | [zoho.com/crm/help/workflow-rules](https://www.zoho.com/crm/help/automation/workflow-rules.html) |
| Learn Deluge Interactive | [deluge.zoho.com/learndeluge](https://deluge.zoho.com/learndeluge) |
| Zoho Creator getRecords | [zoho.com/deluge/help/zoho-services/creator/get-records](https://www.zoho.com/deluge/help/zoho-services/creator/get-records.html) |
| Zoho Creator updateRecord | [zoho.com/deluge/help/zoho-services/creator/update-record](https://www.zoho.com/deluge/help/zoho-services/creator/update-record.html) |

---

## 📬 Contact & Community

- **LinkedIn:** [Rafiullah Nikzad](https://www.linkedin.com/in/rafiullahnikzad)
- **Community:** [Zoho Afghanistan — 10,00+ Members](https://www.linkedin.com/groups/)
- **Portfolio:** [rafiullahnikzad.netlify.app](https://rafiullahnikzad.netlify.app)
- **GitHub:** [55+ Free Deluge Scripts](https://github.com/rafiullahnikzad)

---

*Part of the free Zoho Deluge automation scripts collection — helping businesses automate smarter across the Zoho ecosystem.*
