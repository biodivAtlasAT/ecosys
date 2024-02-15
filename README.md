# ecosys
Ökosystemleistungen und Lebensraumtypen / Ecosystem services and habitat types

Anwenderdokumentation/User documentation: ApplicationDoc.docx

Entwicklerdokumentation/Developer documentation: ServerDoc.docx

Presentation for the TDWG 2023: SYM07_3_TH_M_112315.pdf

Frontend description: 

User Guide functionality

Selecting Ecosystem Service:
Clicking on an ecosystem service (ES) will display it on the map. You can display a legend for the color scheme by clicking on "L." Further information about the ES is available by clicking on the "i." Opening the ES profile in a new tab provides additional information, including calculation methods.

You can select multiple ESs to simultaneously overlay them on the map. The last-selected ES will be displayed on top and is most visible.

The maps are presented as raster data with a grid size of 1x1 km.

ESs are categorized into three main categories: Provisioning, Regulating, and Cultural.

Placing Markers:
Clicking the "Place Marker" button will place a red pin on the map. You can drag and drop it to the desired location. Multiple markers can be placed and moved. Each marker is assigned an ID starting from 0.

Clicking on a placed marker will show the quantity (from 0 to 5) of ESs present in that grid cell in pictograms. Only selected ESs from the list will be displayed. At least one ES must be selected for display.

Additionally, the number of species located in that grid cell in the Biodiversity Atlas of Austria is provided ("Number of Located Species"). Clicking the link opens a new tab with an overview of all species found in that grid cell in the atlas.

A detailed view for the grid cell containing each marker is displayed below the map. Individual markers can be deleted by clicking the "X."

Establishing Connections:
Once at least 2 markers are placed on the map, you can connect them using the "Establish Connection" button. Once connected, the quantity of selected ESs for the grid cells containing the markers is displayed as bar charts to the right of the map.

Options allow you to choose between displaying quantity as quintiles or absolute values and whether values should be displayed only for the placed markers or for every grid cell along the gradient (integrated markers). In the latter case, the bars of placed markers are highlighted in color.

The connection can be hidden by clicking "Hide Connection."

You can zoom in or out of the map using the mouse wheel.

Selecting Layers:
Additional context information, such as districts, road networks, and water networks of Lower Austria, can be displayed on the map.

Choosing Map Display:
If desired, you can change the background map. Options include street map, topographic map, and satellite map. The street map is selected by default.

Selecting Project:
Choose the project you want to display. Currently, only one project that has surveyed ESs is available and is preselected by default.

*(Ecosystem Services as a Design Element in Lower Austria, 2021-2023, funded by the Province of Lower Austria)

"Place Marker" Tooltip:
Places a red pin (marker) in the center of the map, which can be moved to the correct location as desired.

"Establish Connection" Tooltip:
Establishes a connection between all markers placed on the map, ascending by ID.

"i" Tooltip:
Detailed information about ecosystem services.
