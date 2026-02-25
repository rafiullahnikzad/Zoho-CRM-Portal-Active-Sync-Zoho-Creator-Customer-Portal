/**
 * ============================================================
 * CREATOR WORKFLOW: Delete Portal Access
 * LOCATION: Zoho Creator → Customers form → Workflow
 *           Edited > Update of Portal active > Delete Portal access
 *
 * TRIGGER CONDITION: Portal_active == false (handled in code below)
 *
 * PURPOSE:
 *   Handles both cases when Portal_active field is updated:
 *   - Portal_active = false → Removes user from portal (deletes access)
 *   - Portal_active = true  → Assigns user to portal profile (backup invite)
 *
 * DELUGE TASKS USED:
 *   thisapp.portal.deleteUser(email)
 *   → Removes the user from the Creator customer portal
 *   → Docs: https://www.zoho.com/deluge/help/misc-statements/delete-user-portal.html
 *
 *   thisapp.permissions.assignUserInProfile(email, profileName)
 *   → Assigns user to app permission profile
 *   → Docs: https://www.zoho.com/deluge/help/misc-statements/assign-permission-user.html
 *
 * AUTHOR:   Rafiullah Nikzad
 * GITHUB:   https://github.com/rafiullahnikzad
 * ============================================================
 */

// Get the email and portal_active value from the current record
email = input.Email.toString();
portal_active = input.Portal_active.toString();

if(portal_active == "false")
{
    // ============================================================
    // PORTAL ACTIVE = FALSE → Remove user from portal
    // ============================================================
    info "Portal_Active is FALSE → Deleting portal user: " + email;

    // Delete the user from the Creator customer portal
    // Returns: {"emailId":"<specified_email>"}
    delete_response = thisapp.portal.deleteUser(email);
    info "Delete response: " + delete_response;
}
else
{
    // ============================================================
    // PORTAL ACTIVE = TRUE → Assign user to portal profile
    // ============================================================
    info "Portal_Active is TRUE → Assigning portal user: " + email;

    // Assign user to portal profile and send invite
    // Returns: {"profileName":"User Contact","screenName":"<email>"}
    invite_response = thisapp.permissions.assignUserInProfile(email, "User Contact");
    info "Invite response: " + invite_response;
}

// ============================================================
// EXPECTED RESPONSES:
//
// Delete success:
// {"emailId":"user@example.com"}
//
// Invite success:
// {"profileName":"User Contact","screenName":"user@example.com"}
//
// IMPORTANT:
// thisapp.portal.deleteUser() only works inside Zoho Creator.
// It CANNOT be called from Zoho CRM functions.
// That is why this logic lives in a Creator workflow, not CRM.
// ============================================================
