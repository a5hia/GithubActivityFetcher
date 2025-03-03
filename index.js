// Console Color Escape Codes
const red = "\x1b[31m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const blue = "\x1b[34m";
const reset = "\x1b[0m";

// Function to ask GithubAPI for user activity
async function FetchActivity(username) {
    console.log(
        `${blue}Fetching user activity for user${green + username + reset}`,
    );
    const response = await fetch(
        `https://api.github.com/users/${username}/events`,
    );
    if (!response.ok) {
        switch (response.status) {
            case 404:
                throw new Error(`${red}Error: 404.${reset} User is not found.`); // Could be from ratelimit rarely.
            case 403:
                throw new Error(`${red}Error: 403.${reset} Permission denied. Possible rate limit.`);
            case 503:
                throw new Error(`${red}Error: 503.${reset} GithubAPI is down.`); // Could also be server issue
            case 504:
                throw new Error(`${red}Error: 504.${reset} Request timed out.`);
            default:
                throw new Error(`${red}Error:${reset} ${response.status}.`);
        }
    }
    return response.json();
}

// Function to print user activity to console
function PrintActivity(response) {
    if (response.length == 0) {
        // Special case so it doesn't return blank
        console.log(`${red}Error:${reset} No recent activity found.`);
        return;
    }

    response.forEach((event) => {
        // GO through the JSON and return info for each response
        let eventInfo; // Used to transmit data to the premade event script
        // Will add actual specific event date later hopefully. Probably not.
        switch (event.type) {
            case "CreateEvent":
                if (event.payload.ref_type == "branch") {
                    eventInfo = `${green + username + reset} created a branch in ${event.repo.name}`;
                } else {
                    eventInfo = `${green + username + reset} created a ${event.payload.ref_type} called ${event.repo.name}`; // idk if there is another value idk about so keeping like this
                }
                break;
            case "DeleteEvent":
                if (event.payload.ref_type == "branch") {
                    eventInfo = `${green + username + reset} deleted a branch in ${event.repo.name}`;
                } else {
                    eventInfo = `${green + username + reset} deleted a ${event.payload.ref_type} called ${event.repo.name}`;
                }
                break;
            case "ForkEvent":
                eventInfo = `${green + username + reset} forked ${event.repo.name}`;
                break;
            case "MemberEvent":
                eventInfo = `${green + username + reset} added ${event.payload.member.login} to ${event.repo.name}`;
                break;
            case "PublicEvent":
                eventInfo = `${green + username + reset} made ${event.repo.name} public`;
                break;
            case "PullRequestEvent":
                eventInfo = `${green + username + reset} opened a pull request in ${event.repo.name}`;
                break;
            case "PushEvent":
                eventInfo = `${green + username + reset} pushed changes to ${event.repo.name}`;
                break;
            case "ReleseEvent":
                eventInfo = `${green + username + reset} released ${event.payload.release.tag_name} in ${event.repo.name}`;
                break;
            case "WatchEvent":
                eventInfo = `${green + username + reset} starred ${event.repo.name}`;
                break;
            default:
                eventInfo = `${green + username + reset} had a ${event.type} in ${event.repo.name}`;
                break;
        }
        console.log(
            `\n${yellow}Event at ${reset}${event.created_at.substring(0, 10)} ${event.created_at.substring(12, 19)} ${yellow}UTC:${reset}\n${eventInfo}`,
        ); // Premade event script
    });
};

const username = process.argv[2]; // Returns username provided in initial command
if (!username) {
    console.error(`${red}Error:${reset} No Username Provided!`);
    process.exit(`1`); // Catch null case or whatever its called
} else {
    FetchActivity(username)
        .then((events) => {
            PrintActivity(events);
        })
        .catch((err) => {
            console.error(err.message);
            process.exit(1);
        });
};
