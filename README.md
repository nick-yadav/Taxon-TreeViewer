# Taxon-TreeViewer
**Taxon- TreeViewer** an interactive visualization tool to explore the diversity of Pin-II PI sequences in [PINIR](https://pinir.ncl.res.in/) database. It visualizes the distribution of Pin-II PI sequences across species using a tree layout. Users can interactively explore the tree by expanding or collapsing the nodes, changing the tree display orientation and displaying a sub-section of the tree by selecting the root node as per their analysis requirement.

## Implementation
**Taxon- TreeViewer** is implemented using Java Script and makes use of D3 (https://d3.org). Since the taxonomy data is intrinsically hierarchical therefore a hierarchical visualization would help in observing and analyzing the data at multiscale, right from individual element to large groups. To visualize hierarchies D3 has a number of hierarchical Layouts and one of the most popular techniques is the D3s Tree Layout. The Tree Layout arranges the nodes of a hierarchy in a tree like arrangements. It shows topology using discrete marks of nodes and links, such as circle for each node and a line connecting each parent and child. This visualization is derived from [Mike Bostock’s Collapsible tree](https://observablehq.com/@d3/collapsible-tree) example.

## Demo
https://pinir.ncl.res.in/Taxon-TreeViewer/
