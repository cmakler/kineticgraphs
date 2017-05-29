# kineticgraphs

Framework for creating interactive graphs from a JSON definition

The purpose of this code is to allow interactive diagrams to be authored via JSON only. It is similar in spirit to Vega (https://vega.github.io/vega/) in that it seeks to define a declarative language for creating visualizations. However, while Vega is focused on data visualizations, the focus of this project is diagrams. It also is comprised of *two* grammars: one human-facing, and one renderer-facing.

There are three sections of code, which may be used separately or in combination:
* a *Python* authoring environment which converts the author-friendly grammar to the renderer-friendly grammar
* a *Javascript* renderer for web pages
* a *Swift* renderer for mobile and desktop

The reason for the two renderers is clear; originally I envisioned this project as pure JS, but there are some great libraries in Swift that make mobile development really easy. (Plus, I have a student who's interested in developing a Swift implementation, and I think that's a great project!)

The reason for the authoring environment is primarily to offload the burden of creating composite objects: for example, consider a labeled, draggable point object with droplines that each have axis labels. In the rendering world, this object is comprised of one circle which can be dragged in any direction (for the point), two dashed lines which can each be dragged in a single direction (for the droplines), and three text objects (for the point label and the two axis labels). For an author, it makes sense to be able to define just the one point as a single object; but the renderer doesn't care about that, it just wants to know what to draw on the screen. And since many of those objects share coordinates, it makes sense that the author should be able to edit them in one place, and for code to propagate them automatically.

There is a worthy debate as to whether this propagation code properly belongs on the client or the server. The existence of multiple renderers (for web and mobile) argues for the latter, but even with a single renderer I've found that there's a large tax to doing too much of this on the client. If the renderer knows *at the beginning of its process* how many elements are on the screen, it can draw them all and the update code simply adjusts the coordinates of those objects; you don't have to have a recursive process that updates an object and all its children. When there are a lot of objects on the screen, that process can become slow and cumbersome. Additionally, the fewer tasks the renderer has to do, the simpler and lighter the client-side code can be.

I originally envisioned this as part of EconGraphs.org, but I've found that programming the renderer has taken up too much of my time, and as an economist I'm a firm believer in comparative advantage -- my hope is that the community of people interested in creating interactive graphics may find this useful, and can help to make it more robust.
