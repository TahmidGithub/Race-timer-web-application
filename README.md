# Race Timer

## key feature #1
SPA navigation without reloads.
The use of javascript to show/hide sections, ensures that the interactions occur in single page. This reduces server load and allows smooth transitions between screens.

## Key feature #2
User role selection (Marshal).
User is presented with welcome screen. Where the user choose to login as either marshal or racer. If the user selects marshal they get access to race control tools and inferface by the timer-view route.

## Key feature #3
Race control tools (Start/Start next race/Time/Submit/clear results).
Marshal only accessed. The timer handles elapsed race time in hours, minutes, and seconds. 

## Key feature #4
Race recording with racer ID entries.
Starting race will initiate the timer after which the marshal can record times of multiple racers, by clicking time button for each racer. Next to the time recording there is a entry box to enter racer ID. 

## key feature #5
Leaderboard results upon submission.
The timer only stops and resets after submitting results. After which a result summary is immediately created for the marshal. 

## key feature #6
Starting the next race.
The marshal can also easily start the next race, and take the same steps to create next race results while keeping the previous race results.

## Key feature #7
Clearing results from device.
The marshal can also choose to clear all race results any time.

## Key feature #8
Race data is stored using localStorage then uploaded to server.
This makes sure there is resilience to accidental reloads, brief disconnections and airplane mode. The data created is uploaded to server afterwards.

## Key feature #9
Offline functionality
In case the server goes offline. The functionality of all the features are maintained. Except when submitting the race results, they are uploaded to server once the user is online again or when the server is back online.

## Key feature #10
User role selection (Racer).
If the user selects racer they get access to racer-view. After which they are assigned a unique numeric ID automatically. Their unique ID is used as session ID. This ensures racers can be individually tracked in a race, and treats each racer as an anonymous, indexed participant.

## Key feature #11
Racer recieves race results for only the race they participated in.
This ensures that the racer only recieves relevant leaderboard results to maintain clarity.

## key feature #12
Offline racer functionality.
If the server goes offline, the racers still have their unqiue IDs. Recieving the correct leaderboard results is ensured once the server is back online.

# AI
I used AI to form better understanding of concepts and techniques that I didn't grasp properly. here's how that was done:

## #1 I didn't understand how localstorage can be used for relavent persistant data. My prompt was:
"How can I initiate localstorage to set, remove or get items?"
AI expanded to give me examples of how localstorage is used to set a item, remove a item and get items. Which is useful as I got a crucial understanding of the tool through the relatable examples given to me.

## #2 I was struggling to create different routes and handle navigation between seperate pages and ensure the right elements appear. My prompt was:
"How to create single page application to create different screens?"
AI gave me a example of the routes function in my index.js as well as the handleroute function. I adjusted it so that only certain functions are ran in each route.

## #3 To handle sending data to server or clearing data from server. Server is required to fetch or delete data. I wasn't sure how to exactly implement that. My prompt was:
"How to fetch and clear data from a simple express server?"
AI briefly explained the fetch and delete use cases. After which I got a clear understanding of how to implement it to my server.

## #4 I implemented offline functionality of sending data post-offline. I ran into a issue of the server sending duplicate data after user comes back online because I had no way to track races. My prompt was:
"How can I make it so that in my server I can ensure duplicate data isn't fetched?"
AI introduced me the concept of using hash for each race data. The hash creates unique identifier to track each race data which makes it so that same result isn't sent in duplicates.

## #5 To serve seamless user offline stability. I had at first made data persist by using localstorage. However when going offline the site fully shuts down. I realised that this was due to nothing being cached so the client had nothing to fall back on. So I implemented a service worker js. What the issue I faced was that the data created while offline wasn't being fetched after returning online. My prompt was:
"How can i easily fetch data after user has returned online?"
AI suggested that I use the hash method to create a fetch request. Which I implemented into my server.
