/**
 * ============================================================
 * CREATOR WORKFLOW: Send Portal Invitation to Customers
 * LOCATION: Zoho Creator → Customers form → Workflow
 *           Edited > Update of Portal active > Send Portal Invitation
 *
 * TRIGGER CONDITION: Portal_active == true
 *
 * PURPOSE:
 *   Assigns the user to the "Client" portal profile in Zoho Creator,
 *   which sends them an invitation email with a link to access
 *   the customer portal.
 *
 * DELUGE TASK USED:
 *   thisapp.portal.assignUserInProfile(email, profileName)
 *   → Assigns email to the specified portal permission profile
 *   → Sends portal invite email automatically
 *   → Docs: https://www.zoho.com/deluge/help/misc-statements/assign-permission-portal-user.html
 *
 * AUTHOR:   Rafiullah Nikzad
 * GITHUB:   https://github.com/rafiullahnikzad
 * ============================================================
 */

// Get the email from the current Creator record being edited
response = thisapp.portal.assignUserInProfile(input.Email, "Client");

// Log the response for debugging (uncomment info line to see in logs)
// info "Portal Invite sent ------> " + response;

// ============================================================
// EXPECTED RESPONSE (success):
// {"profileName":"Client","screenName":"user@example.com"}
//
// EXPECTED RESPONSE (already exists):
// {"error":"User already exists in the portal"}
//
// NOTE: Profile name "Client" must match exactly as configured
// in your Creator app under Settings > Portal > Permissions
// ============================================================
