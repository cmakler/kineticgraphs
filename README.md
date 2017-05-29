# kineticgraphs

Framework for creating interactive graphs from a JSON definition

The purpose of this code is to allow interactive diagrams to be authored via JSON only. It is similar in spirit to Vega (https://vega.github.io/vega/) in that it seeks to define a declarative language for creating visualizations. However, while Vega is focused on data visualizations, the focus of this project is diagrams. It also is comprised of *two* grammars: one human-facing, and one renderer-facing.

There are three sections of code, which may be used separately or in combination:
* a *Python* authoring environment which converts the author-friendly grammar to the renderer-friendly grammar
* a *Javascript* renderer for web pages
* a *Swift* renderer for mobile and desktop

The reason for the two renderers is clear; originally I envisioned this project as pure JS, but there are some great libraries in Swift that make mobile development really easy. (Plus, I have a student who's interested in developing a Swift implementation, and I think that's a great project!)

The reason for the authoring environment is twofold. The first is to offload the burden of creating composite objects: for example, consider a labeled, draggable point object with droplines that each have axis labels. In the rendering world, this object is comprised of one circle which can be dragged in any direction (for the point), two dashed lines which can each be dragged in a single direction (for the droplines), and three text objects (for the point label and the two axis labels). For an author, it makes sense to be able to define just the one point as a single object; but the renderer doesn't care about that, it just wants to know what to draw on the screen.
