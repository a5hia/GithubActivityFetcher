// Function to ask GithubAPI for user activity
async function FetchActivity(username) {
    console.log(`Fetching user activity for user ${username}`)
    const response = await fetch(
        `https://api.github.com/users/${username}/events`
    );
    if (!response.ok) {
        switch (response.status) {
            case 404:
                throw new Error(`Error: 404. User is not found.`) // Could be from ratelimit rarely.
            case 403:
                throw new Error(`Error: 403. Permission denied. Possible rate limit.`)
            case 503:
                throw new Error(`Error: 503. GithubAPI is down.`) // Could also be server issue
            case 504:
                throw new Error(`Error: 504. Request timed out.`)
            default:
                throw new Error(`Error: ${response.status}.`)
        }
    }
    return response.json();
};

// Function to print user activity to console
function PrintActivity(response) {
    if (response.length == 0) { // Special case so it doesn't return blank
        console.log("No recent activity found.")
        return
    };
    
    response.forEach((event) =>{ // GO through the JSON and return info for each response
        let eventInfo; // Used to transmit data to the premade event script
        // Will add actual specific event date later hopefully. Probably not.
        /* switch (event.type) {
            case "CreateEvent":
                let eventInfo = `${username} created a ${event.payload.ref_type} called/in`
        };*/
        eventInfo = `${event.type} in ${event.repo.name}` // Default case. Not in because lazy.
        console.log(`- Event at ${event.created_at.substring(0,10)} ${event.created_at.substring(12,19)} UTC -\n${eventInfo}` ) // Premade event script
    });
}

const username = process.argv[2] // Returns username provided in initial command
if (!username) {
    console.error(`No Username Provided!`)
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