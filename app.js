var portals = [
  {
    name: 'Hub',
    x: -4,
    y: 19
  },
  {
    name: 'Ocean Monument',
    x: 147,
    y: -167
  },
  {
    name: 'Witch Farm',
    x: -56,
    y: 16
  },
  {
    name: 'Empty Village',
    x: -47,
    y: -52
  },
  {
    name: 'Stronghold',
    x: -14,
    y: -79
  },
  {
    name: 'Woods of the Chicken',
    x: 116,
    y: 19
  },
  {
    name: 'Swamp Farms',
    x: -17,
    y: 30
  },
  {
    name: 'Mesa Farms',
    x: -636,
    y: -390
  },
  {
    name: 'Jungle',
    x: -1152,
    y: -312
  },
  {
    name: 'Desert Shore',
    x: -829,
    y: -303
  }
];

var svg = document.querySelector('svg');

var margin = 100;

var routesTable = buildRoutesTable();

//outputs log every point on the path.
//var routePoints = getRoutePoints();
//console.log(routePoints);
var routeIntersects = getIntersects();
console.log(routeIntersects);

makeMap();
plotPortals();
plotRoutes();
plotIntersects();

function buildRoutesTable () {
  let routes = [];
  portals.forEach(portal => {
    portals.forEach(otherPortal => {
      if (portal.name !== otherPortal.name) {
        let routeExists = routes.find(route => {
          return (route.start === portal.name && route.end === otherPortal.name) || (route.start === otherPortal.name && route.end === portal.name);
        });
        if (!routeExists) {
          routes.push(getRoute(portal, otherPortal));
        }
      }
    });
  });
  return routes;
}

function getRoute (start, end) {
  let route = {
    start: start.name,
    end: end.name,
    points: [],
    id: Date.now()
  };
  let pos = {x: start.x, y: start.y};
  let dist = getTaxiDist(start, end);
  let shortestDirX = dist.x < dist.y;
  route.points.push({x: start.x, y: start.y, turn: false, vertical: shortestDirX});
  let distGtrZero = true;
  while (distGtrZero) {
    dist = getTaxiDist(pos, end);
    if (dist.x + dist.y === 0) {
      distGtrZero = false;
      break;
    }
    let turn = false;
    let newShortestDirX = shortestDirX;
    if (dist.x === 0 && dist.y > 0) {
      newShortestDirX = true;
    }
    else if (dist.x > 0 && dist.y === 0) {
      newShortestDirX = false;
    }
    if (newShortestDirX !== shortestDirX) {
      turn = true;
      shortestDirX = newShortestDirX;
    }
    if (!shortestDirX && dist.x > 0) {
      if (pos.x > end.x) {
        pos.x--;
      }
      else {
        pos.x++;
      }
    }
    else if (shortestDirX && dist.y > 0){
      if (pos.y > end.y) {
        pos.y--;
      }
      else {
        pos.y++;
      }
    }
    route.points.push({x: pos.x, y: pos.y, turn: turn, vertical: shortestDirX});
  }
  route.points.push({x: end.x, y: end.y, turn: false, vertical: shortestDirX});
  return route;
}

function getTaxiDist(start, end) {
  return {
    x: Math.abs(end.x - start.x),
    y: Math.abs(end.y - start.y)
  };
}

function getRoutePoints () {
  let routePts = [];
  for (let route of routesTable) {
    for (let pt of route.points) {
      let routePtIndex = routePts.findIndex(routePt => {
        return routePt.x == pt.x && routePt.y == pt.y;
      });
      if (routePtIndex == -1) {
        routePts.push(pt);
      }
    }
  }
  return routePts;
}

function getIntersects () {
  //find points where routes overlap and the orientation of the rail differs
  let intersects = [];
  for (let route of routesTable) {
    for (let otherRoute of routesTable) {
      if (otherRoute.id !== route.id) {
        for (let pt of route.points) {
          let alreadyIntersect = intersects.findIndex(intersect => {
            return pt.x == intersect.x && pt.y == intersect.y;
          });
          if (alreadyIntersect > -1) {
            continue;
          }
          let newIntersect = otherRoute.points.find(otherPt => {
            return pt.x == otherPt.x &&
                   pt.y == otherPt.y &&
                   ((pt.vertical !== otherPt.vertical) || (pt.turn !== otherPt.turn) || (pt.turn && otherPt.turn));
          });
          if (newIntersect) {
            intersects.push(pt);
          }
        }
      }
    }
  }
  return intersects;
}

function makeMap () {
  let bounds = findBounds();
  let mapWidth = Math.abs(bounds.maxX - bounds.minX);
  let mapHeight = Math.abs(bounds.maxY - bounds.minY);
  let renderMinX = bounds.minX-margin;
  let renderMinY = bounds.minY-margin;
  let renderWidth = mapWidth + 2*margin;
  let renderHeight = mapHeight + 2*margin;
  svg.setAttribute('width',renderWidth*2);
  svg.setAttribute('height',renderHeight*2);
  svg.setAttribute('viewBox', [renderMinX, renderMinY, renderWidth, renderHeight].join(' '));

  let bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('fill', '#6666ff');
  bg.setAttribute('x', renderMinX);
  bg.setAttribute('y', renderMinY);
  bg.setAttribute('width', renderWidth);
  bg.setAttribute('height', renderHeight);
  svg.appendChild(bg);
}

function plotPortals () {
  for (let portal of portals) {
    let marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    marker.setAttribute('transform', 'translate('+portal.x+' '+portal.y+')');
    let point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    point.setAttribute('cx', 0);
    point.setAttribute('cy', 0);
    point.setAttribute('r', '5');
    point.setAttribute('fill', 'red');
    let label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.textContent = portal.name;
    label.setAttribute('y', -10);
    label.setAttribute('text-anchor', 'middle');
    marker.appendChild(point);
    marker.appendChild(label);
    svg.appendChild(marker);
  }
}

function plotRoutes () {
  for (let route of routesTable) {
    let routePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    routePath.setAttribute('stroke', 'red');
    routePath.setAttribute('fill', 'none');
    let pathString = '';
    for (let i=0; i<route.points.length; i++) {
      let pt = route.points[i];
      let snip = '';
      if (i === 0) {
        snip = 'M';
      }
      else {
        snip = 'L';
      }
      snip += pt.x + ',' + pt.y + ' ';

      pathString += snip;
    }
    routePath.setAttribute('d', pathString);
    svg.appendChild(routePath);
  }
}

function plotIntersects () {
  for (let intersect of routeIntersects) {
    let marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    marker.setAttribute('transform', 'translate('+intersect.x+' '+intersect.y+')');
    let point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    point.setAttribute('cx', 0);
    point.setAttribute('cy', 0);
    point.setAttribute('r', '3');
    point.setAttribute('fill', 'yellow');
    marker.appendChild(point);
    svg.appendChild(marker);
  }
}

function findBounds () {
  let maxX = -Infinity;
  let maxY = -Infinity;
  let minX = Infinity;
  let minY = Infinity;

  for (let portal of portals) {
    if (portal.x < minX) {
      minX = portal.x;
    }
    if (portal.x > maxX) {
      maxX = portal.x;
    }
    if (portal.y < minY) {
      minY = portal.y;
    }
    if (portal.y > maxY) {
      maxY = portal.y;
    }
  }
  return {
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY
  };
}
