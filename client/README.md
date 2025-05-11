Race Time - by up2120491

<!-- key feature #1 -->
SPA navigation without reloads.
The use of javascript to show/hide sections, ensures that the interactions occur in single page. This reduces server load and allows smooth transitions between screens.

<!-- Key feature #2 -->
User role selection (Marshal).
User is presented with welcome screen. Where the user choose to login as either marshal or racer. If the user selects marshal they get access to race control tools and inferface by the timer-view route.

<!-- Key feature #3 -->
Race control tools (Start/Start next race/Time/Submit/clear results).
Marshal only accessed. The timer handles elapsed race time in hours, minutes, and seconds. 

<!-- Key feature #4 -->
Race recording with racer ID entries.
Starting race will initiate the timer after which the marshal can record times of multiple racers, by clicking time button for each racer. Next to the time recording there is a entry box to enter racer ID. 

<!-- key feature #5 -->
Leaderboard results upon submission.
The timer only stops and resets after submitting results. After which a result summary is immediately created for the marshal. 

<!-- key feature #6 -->
Starting the next race.
The marshal can also easily start the next race, and take the same steps to create next race results while keeping the previous race results.

<!-- Key feature #7 -->
Clearing results from device.
The marshal can also choose to clear all race results any time.

<!-- Key feature #8 -->
Race data is stored using localStorage then uploaded to server.
This makes sure there is resilience to accidental reloads, brief disconnections and airplane mode. The data created is uploaded to server afterwards.

<!-- Key feature #9 -->
Offline functionality
In case the server goes offline. The functionality of all the features are maintained. Except when submitting the race results, they are uploaded to server once the user is online again or when the server is back online.

<!-- Key feature #10 -->
User role selection (Racer).
If the user selects racer they get access to racer-view. After which they are assigned a unique numeric ID automatically. Their unique ID is used as session ID. This ensures racers can be individually tracked in a race, and treats each racer as an anonymous, indexed participant.

<!-- Key feature #11 -->
Racer recieves race results for only the race they participated in.
This ensures that the racer only recieves relevant leaderboard results to maintain clarity.

<!-- key feature #12 -->
Offline racer functionality.
If the server goes offline, the racers still have their unqiue IDs. Recieving the correct leaderboard results is ensured once the server is back online.

<!-- AI -->
I used AI to form better understanding of concepts and techniques that I didn't grasp properly. here's how that was done:

#1 I didn't understand how localstorage can be used for relavent persistant data. My prompt was:
"How can I initiate localstorage to set, remove or get items?"
AI expanded to give me examples of how localstorage is used to set a item, remove a item and get items. Which is useful as I got a crucial understanding of the tool through the relatable examples given to me.

#2 Speak about SPA

#3 Speak about API in server. how data is sent and cleared

#4 speak about the struggle of getting offline functionality

#5 speak about how you were facing issues with duplicate result data 