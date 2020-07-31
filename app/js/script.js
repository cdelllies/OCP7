// Variables
let user,
    map,
    mapStyle = [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }]
        },
        {
            featureType: 'poi',
            elementType: 'all',
            //stylers: [{ color: '#d59563' }]
            stylers: [{ visibility: "off" }]
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }]
        },
        {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }]
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }]
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }]
        }
    ],
    restaurantCollection = [],
    starSvg = `<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-star-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.283.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
</svg>`,
    restaurants = []
const $ = document

function initMap() {
    navigator.geolocation.getCurrentPosition(centerMap, noLocation)
}

function centerMap(location) {
    user = { lat: location.coords.latitude, lng: location.coords.longitude };
    map = new google.maps.Map(
        document.getElementById('map'), { zoom: 15, center: user, styles: mapStyle });
    var userMarker = new google.maps.Marker({ position: user, animation: google.maps.Animation.DROP, map: map, title: "Vous êtes là", icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" });
    
    map.addListener('click', function (mapsMouseEvent) {
        let latlng = mapsMouseEvent.latLng.toString()
        latlng = latlng.replace('(', '')
        latlng = latlng.replace(')', '')
        latlng = latlng.split(', ')
        console.log(latlng)
        console.log($.querySelector('#editor').checked)
            if ($.querySelector('#editor').checked) {
                let name = prompt("Quel est le nom du restaurant")
                //fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=47.46634361862981,-0.549963790178305&key=AIzaSyCPL0ytHoiwfncMjqnKtANnbi0ukEDxBFI`)
                fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng[0]},${latlng[1]}&key=AIzaSyCPL0ytHoiwfncMjqnKtANnbi0ukEDxBFI`)
                    .then((res) => {
                        return res.json()
                    })
                    .then((data)=>{
                        let obj = new Object
                        obj.restaurantName = name
                        id = restaurantCollection.length
                        obj.address = data.results[0].formatted_address
                        obj.lat = parseFloat(latlng[0])
                        obj.long = parseFloat(latlng[1])
                        obj.ratings = new Array
                        restaurantCollection.push(new Restaurant(obj, id))
                        let near = nearSort(restaurantCollection, 1)
                        console.log(near)
                        $.querySelectorAll('.restaurantCard').forEach(el => el.remove())
                        near.forEach(el=>el.displayShortCard())
                    })
            }
    });
    fetchNear()
}

function noLocation() {
    let location = {}
    location.coords = {}
    location.coords.latitude = 47.46667
    location.coords.longitude = -0.55
    centerMap(location)
}

function fetchNear() {
    // fetch('../api/places.json')
    //     .then(res => res.json())
    //     .then(json => {
    //         console.log(json)
    //         let near = nearSort(json)
    //         return near
    //     }).then(places => {
    //         console.log(places)
    //         for (let i = 0; i < places.length; i++) {
    //             const el = places[i];
    //             restaurantCollection.push(new Restaurant(el, i))
    //         }
    //     })
    var request = {
        location: {lat : user.lat, lng : user.lng},
        radius: '500',
        type: ['restaurant'],
      };
    
      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, (res) => {
        console.log(res)
        console.log(res.rating)
        console.log(res.reviews)
      });
}

function eventHandler(e) {
    let element = e.toElement
    while (element.tagName != "DIV") {
        element = element.parentNode
    }
    if (e.toElement.tagName === 'BUTTON') {
        let id = element.dataset.id
        restaurantCollection[id].addRate()
    } else {
        restaurantCollection[element.dataset.id].toggleDesc(element)
    }
}

function sliderChange(value) {
    $.querySelector('#value').innerText = `Note minimum : ${value}`
    $.querySelectorAll('.restaurantCard').forEach(el => el.remove())
    restaurantCollection.forEach(el => el.filterStars(value, 5))
}

function difference(a, b) {
    return Math.abs(a - b);
}

function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        return dist;
    }
}

function nearSort(data, type = 0){
    let array = []
    data.forEach(el => {
        let diff = distance(user.lat, user.lng, el.lat, type ? el.lng : el.long, "K")
        if (diff < 10) {
            el.diff = diff
            array.push(el)
        }
    })
    array.sort(function (a, b) {
        let keyA = a.diff,
            keyB = b.diff;
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    })
    return array
}

//close overlay

// function eventFire(el, etype) {
//     if (el.fireEvent) {
//         el.fireEvent('on' + etype);
//     } else {
//         var evObj = document.createEvent('Events');
//         evObj.initEvent(etype, true, false);
//         el.dispatchEvent(evObj);
//     }
// }
// setTimeout(() => {
//     eventFire(document.querySelector('.dismissButton'), 'click')
// }, 4000)

// function testEvent(e) {
//     console.log(e)
// }