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

//
//in Zoho creator create a function and put below code

void appSharing.shareToUser(string userEmail)
{
	sharingResponse = thisapp.permissions.assignUserInProfile(userEmail,"User Contact");
	sendmail
	[
		from :zoho.adminuserid
		to :userEmail
		subject :"Invitation to access '" + zoho.appname + "' "
		message :"<div style='width:100%;display:inline-block;box-sizing:border-box;border:1px solid #ddd;'><div style='padding:2%;text-align:center;'>You've been invited to use an application built on Zoho Creator by \"" + zoho.adminuserid + "\".</div><div style='background: #efefef; padding: 20.0px;margin: 20.0px 0 10.0px;text-align:center;'><h2>" + zoho.appname.toUpperCase() + "</h2><div style='margin: 20.0px 0 10.0px;'><a style='padding:10px;background-color: rgb(62,149,205);text-decoration: none;color: rgb(255,255,255);font-size: 14.0px;' href='https://creator.zoho.com" + zoho.appuri + "' target='_blank'> Go to application </a></div></div></div>"
	]
}
