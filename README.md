# Locative Audio
This is a lightweight framework for creating locative audio tours, built on [__leaflet__](https://leafletjs.com/) and [__bootstrap__](https://getbootstrap.com/), and created for cartography education at UW-Madison.

## How to Use
To get a tour started, download the whole folder and edit the __stops.csv__ file in the __assets__ folder. 

There are a few required elements in the csv file, used to set the content at each stop.

__id__: The number of the stop on the tour. 

__name__: Name of the stop. This will appear in the stop's popup.

__hidden__: Controls whether the stop will be visible as a point on the map, or invisible to a user. An invisible point will play audio when a user nears, but will not display a popup or text.

__audio__: Name of the audio file (located in the __audio__ folder) that will play when the stop is entered. Requires a file extension! 

__lat__: Latitude of the stop.

__lon__: Longitude of the stop.

__text__: The text that displays when a stop is either tapped or entered. Ideally, this match the audio that is played.

__image__: Image file that will display in the stop's pop-up (located in the __assets__ folder). Requires a file extension!

## Advanced Use
If you have some javascript or Leaflet know-how, you can adjust the style and cartographic design in the __main.js__ file.