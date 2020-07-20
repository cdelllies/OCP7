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

class Restaurant {
    constructor(el, id) {
        this.id = id
        this.details = el
        this.restaurantName = el.restaurantName
        this.lat = el.lat
        this.lng = el.long
        this.ratings = el.ratings
        this.descRendered = false
        this.desc = this.displayShortCard()
        this.marker = new google.maps.Marker({ position: { lat: this.lat, lng: this.lng }, animation: google.maps.Animation.DROP, map: map, title: this.restaurantName, icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png" });
    }
    displayShortCard() {
        this.desc = $.createElement('p')
        let titleBar = $.createElement("span"),
            div = $.createElement("div"),
            title = $.createElement("h5"),
            average = $.createElement('div'),
            rate = 0

        title.innerText = this.restaurantName

        titleBar.classList.add("d-flex", "justify-content-between")
        titleBar.append(title)

        this.desc.append(document.createElement('h5').innerHTML = "Avis")

        if (this.ratings.length > 0) {
            this.ratings.forEach(rating => {
                let rateCard = $.createElement('article')
                rateCard.classList.add('row', 'commentCard')

                let comment = $.createElement('p')
                comment.innerText = rating.comment
                comment.classList.add('col-10')
                rateCard.append(comment)

                let stars = $.createElement('span')
                stars.innerHTML = rating.stars + '&nbsp' + starSvg
                stars.classList.add('col-2', 'text-right')
                rateCard.append(stars)

                rate += rating.stars
                this.desc.append(rateCard)
            });
            rate = rate / ratings.length
        } else {
            rate = '?'
        }

        average.innerHTML = rate + '&nbsp' + starSvg
        titleBar.append(average)

        div.classList.add('container-fluid', 'restaurantCard')
        div.append(titleBar)
        div.addEventListener('click', eventHandler)
        div.dataset.id = this.id
        document.querySelector("#cardContainer").append(div)
        return this.desc
    }
    toggleDesc(el) {
        if (!this.descRendered) {
            let img = $.createElement('img')

            //img.src = '../api/streetview.jpg'
            img.src = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${this.lat},${this.lng}&heading=151.78&pitch=-0.76&key=AIzaSyCPL0ytHoiwfncMjqnKtANnbi0ukEDxBFI`

            this.desc.insertBefore(img, this.desc.childNodes[0])
            this.descRendered = true
            el.append(this.desc)
        } else if (el.childNodes.length > 1) {
            el.removeChild(el.childNodes[1])
        } else {
            el.append(this.desc)
        }
    }
}

function initMap() {
    navigator.geolocation.getCurrentPosition(centerMap, noLocation)
}

function centerMap(location) {
    user = { lat: location.coords.latitude, lng: location.coords.longitude };
    map = new google.maps.Map(
        document.getElementById('map'), { zoom: 15, center: user, styles: mapStyle });
    var userMarker = new google.maps.Marker({ position: user, animation: google.maps.Animation.DROP, map: map, title: "Vous êtes là", icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" });
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
    fetch('../api/places.json')
        .then(res => res.json())
        .then(json => {
            console.log(json)
            let near = []
            json.forEach(el => {
                let diff = distance(user.lat, user.lng, el.lat, el.long, "K")
                if (diff < 10) {
                    el.diff = diff
                    near.push(el)
                }
            })
            near.sort(function (a, b) {
                let keyA = a.diff,
                    keyB = b.diff;
                if (keyA < keyB) return -1;
                if (keyA > keyB) return 1;
                return 0;
            })
            return near
        }).then(places => {
            console.log(places)
            for (let i = 0; i < places.length; i++) {
                const el = places[i];
                restaurantCollection.push(new Restaurant(el, i))
            }
        })
}

function eventHandler(e = null, el = null) {
    let element = _.isNull(e) ? el : e.toElement

    if (element.tagName !== "DIV") {
        eventHandler(null, element.parentNode)
    } else {
        restaurantCollection[element.dataset.id].toggleDesc(element)
    }
}

function difference(a, b) {
    return Math.abs(a - b);
}



// function createCard(el) {
//     let div = $.createElement("div"),
//         titleBar = $.createElement("span"),
//         title = $.createElement("h5"),
//         average = $.createElement('div'),
//         desc = $.createElement('p'),
//         img = $.createElement('img'),
//         rate = 0

//     title.innerText = el.restaurantName

//     titleBar.classList.add("d-flex", "justify-content-between")
//     titleBar.append(title)

//     img.src = '../api/streetview.jpg'
//     //img.src = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${el.lat},${el.long}&heading=151.78&pitch=-0.76&key=AIzaSyCPL0ytHoiwfncMjqnKtANnbi0ukEDxBFI`

//     desc.append(img)

//     desc.append(document.createElement('h5').innerHTML = "Avis")
//     if (el.ratings.length > 0) {
//         el.ratings.forEach(rating => {
//             let rateCard = $.createElement('article')
//             rateCard.classList.add('row', 'commentCard')

//             let comment = $.createElement('p')
//             comment.innerText = rating.comment
//             comment.classList.add('col-10')
//             rateCard.append(comment)

//             let stars = $.createElement('span')
//             stars.innerHTML = rating.stars + '&nbsp' + starSvg
//             stars.classList.add('col-2', 'text-right')
//             rateCard.append(stars)

//             rate += rating.stars
//             desc.append(rateCard)
//         });
//         rate = rate / ratings.length
//     } else {
//         rate = '?'
//     }

//     average.innerHTML = rate + '&nbsp' + starSvg
//     titleBar.append(average)
//     desc.style.display = 'none'

//     div.classList.add('container-fluid', 'restaurantCard')
//     div.append(titleBar)
//     div.append(desc)
//     div.addEventListener('click', eventHandler)
//     document.querySelector("#cardContainer").append(div)
// }



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

//close overlay

function eventFire(el, etype) {
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
}
setTimeout(() => {
    eventFire(document.querySelector('.dismissButton'), 'click')
}, 4000)
