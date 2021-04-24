/*
*    main.js
*    PINIR Visualizations
*    Project 1 - Taxonomy Tree (Vertical)
*/

//To make Responsive to Screen Size
const width = document.body.clientWidth;
const height = document.body.clientHeight;
const svg = d3.select("#chart-area").select('svg');
svg.attr('width', width).attr('height', height);

// Margin Convention
const margin = { top: 40, right: 180, bottom: 320, left: 150 }
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// Creating the Tree Layout and setting up it's size
let treeLayout = d3.tree();

// Declaring an instance of Vertical Path Generator
let linkPathGenerator;

//const t = d3.transition().duration(750);// Instance of D3 Transition
function getTransition() {// Function to get transition for d3.v.6
    return d3.transition()
        .duration(750)
    //.ease(d3.easeLinear)
}
let i = 0;// For nodes ID
let root;// Storing root of Hierarchy
let root_O;// For saving an Original Copy
let treeOrientation = 1;// Vertical (1), Horizontal (0)
// Event Listeners
$("#var-select").on("change", selectRoot)
$("#orientation-select").on("change", selectOrientation)

// Loading the Taxonomy CSV file
d3.csv('data/taxonomy.csv').then(data => {
    // Cleaning data
    data.forEach(d => {
        d.PICount = +d.PICount;
        $("#var-select").append(`<option value="${d['Scientific name']}">${d['Scientific name']}</option>`)
    });
    console.log(data);
    // Converting CSV data into hierarchical format and storing it's root node
    root = d3.stratify()
        .id(d => d.Taxon)
        .parentId(d => d.Parent)
        (data);
    console.log(root);
    root_O = root.copy();//saving an Original Copy

    // Initialise the root 
    initRoot(root);
    // Calling a function for initial rendering of the tree till 11th Level
    updateTree(root);
})

// This function does the work of rendering the tree on the screen, it takes a tree node as a parameter. 
function updateTree(source) {
    if (treeOrientation) {
        treeLayout.size([innerWidth, innerHeight]);
        linkPathGenerator = d3.linkVertical().x(d => d.x).y(d => d.y);
    } else {
        treeLayout.size([innerHeight, innerWidth]);
        linkPathGenerator = d3.linkHorizontal().x(d => d.y).y(d => d.x);
    }
    console.log(source);
    // Compute the new tree layout.
    treeLayout(root);
    const nodes = root.descendants();// Get an array of all the nodes
    const links = root.links();// Get an array of all the links
    console.log(nodes)
    console.log(links)

    // ****************** Nodes section ***************************
    //Joining new data
    const node = g.selectAll('g')
        .data(nodes, d => d.id || (d.id = ++i));

    /*** Nodes Enter Selection ***/
    // Enter any new nodes at the parent's previous position.
    const enterNode = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', treeOrientation ? `translate(${source.x0},${source.y0})` : `translate(${source.y0},${source.x0})`)
        .on('click', nodeClicked);

    // Add Circle for the nodes
    enterNode.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", d => d._children ? "#fdc793" : "#fff")

    // Add labels for the nodes
    enterNode.append('text')
        .text(d => `${d.data['Scientific name']}(${d.data.PICount})`)
        .style("fill-opacity", 1e-6);

    /*** Nodes Update Selection ***/
    const updateNode = enterNode.merge(node);

    // Transition to the proper position for the node
    updateNode.transition(getTransition())
        .attr('transform', d => treeOrientation ? `translate(${d.x},${d.y})` : `translate(${d.y},${d.x})`)

    // Update the Circle attributes and style
    updateNode.select('circle')
        .transition(getTransition())
        .attr('r', 5)
        .style("fill", d => d._children ? "#fdc793" : "#fff")
        .attr('cursor', 'pointer');

    // Update the Labels attributes and style
    updateNode.select("text")
        .text(d => `${d.data['Scientific name']}(${d.data.PICount})`)
        .transition(getTransition())
        /* This sets the "Y" position of "Root" node and the 
       "Leaf" nodes */
        .attr('y', d => {
            if (treeOrientation) {
                if (!d.parent || (!d.parent && !d.children)) return -20
                else if (!d.children) {
                    return 5
                }
            }
            else {
                if (d.parent && d.children) { return d.altCount ? -25 : 25 }
            }
        })
        /* This sets the "X" position of intermediate nodes depending upon
        the value of their boolean variable "altCount" */
        .attr('x', d => {
            if (treeOrientation) {
                if (d.parent && d.children) { return d.altCount ? -15 : 15 }
                else if (!d.children) {
                    return 15
                }
            }
            else {
                if (!d.parent) return -20
                else if (!d.children) {
                    return 13
                }
            }
        })
        /* This sets the label text anchors of nodes depending upon whether
        they are Root, Leaf or intermediatry nodes */
        .attr('text-anchor', d => {
            if (treeOrientation) {
                if (!d.parent) return "middle" //Root Node
                else if (!d.children) {// Leaf Nodes
                    return "start"
                } else {
                    return d.altCount ? "end" : "start"
                }
            }
            else {
                if (!d.parent) return "end" //Root Node
                else if (!d.children) {// Leaf Nodes
                    return "start"
                } else {
                    return "middle"
                }
            }
        })
        .attr('transform', d => {
            if (treeOrientation)
                return (d.parent && !d.children) ? 'rotate(90)' : 'rotate(0)'
        })
        .style("fill-opacity", 1);

    /*** Nodes Exit Selection ***/
    const exitNode = node.exit().transition(getTransition())
        .attr('transform', treeOrientation ? `translate(${source.x},${source.y})` : `translate(${source.y},${source.x})`)
        .remove();

    // On exit reduce the node circles size to 0
    exitNode.select('circle')
        .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    exitNode.select('text')
        .style('fill-opacity', 1e-6);


    // ****************** links section ***************************
    const link = g.selectAll('path')
        .data(links, d => d.target.id);// Data Join

    /*** Links Enter/Update Selection ***/
    link.enter().insert('path', 'g')// Enter Selection
        .attr('class', 'link')
        .attr('d', treeOrientation
            ? d3.linkVertical().x(source.x0).y(source.y0)
            : d3.linkHorizontal().x(source.y0).y(source.x0))
        .merge(link)// Update Selection
        .transition(getTransition())
        .attr('d', linkPathGenerator);

    /*** Links Exit Selection ***/
    link.exit().transition(getTransition())
        .attr('d', treeOrientation
            ? d3.linkVertical().x(source.x).y(source.y)
            : d3.linkHorizontal().x(source.y).y(source.x))
        .remove();

    // Store the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}
function nodeClicked(event, d) {
    console.log(d.altCount)
    console.log(d.parent)
    console.log(d.children)
    console.log(d);
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    console.log(d.children)
    updateTree(d);
}
// Function to set the root node based upon selection of Taxonomy Select Control
function selectRoot() {
    console.log($("#var-select").val())
    console.log(root_O);
    root_O.each((d => {
        if (d.data['Scientific name'] == $("#var-select").val()) {
            console.log(d.data['Scientific name']);
            root = d.copy();
        }
    }
    ));
    console.log(root);
    // Initialise the root for initial rendering
    initRoot(root);
    // Calling a function for initial rendering of the tree till 11th Level
    updateTree(root);
}
// This function Initialises the root node
function initRoot(root) {
    /*Initialising the position where root node will enter, later it will store
    the position of parent node where any child node will enter before transitioning
    to its original position.*/
    root.x0 = innerWidth / 2;
    root.y0 = 0;

    // Collapse after the eleventh level
    /* Also setting a boolean variable altCount for each node: If a node 
        doesn't have a parent it's altCount is set to '0'. Otherwise it's 
        altCount is set opposite to that of it's parent's. On the basis of
        this altCount later the "y" position of labels for each node is determined.
    */
    root.each((d => {
        d.altCount = d.parent ?
            d.parent.altCount ? 0 : 1
            : 0;
        //d._children = d.children;
        //console.log(d.depth)
        if (d.depth == 11) {
            collapse(d)
        }
    }));
}
// Function to Collapse the node and all it's children
function collapse(d) {
    d.altCount = d.parent.altCount ? 0 : 1 // Setting altCount
    if (d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
    }
}
function selectOrientation() {
    treeOrientation = +$("#orientation-select").val(); // + operator to covert to integer
    console.log(treeOrientation);
    updateTree(root);
}