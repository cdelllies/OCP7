class Restaurant {
    constructor(el, id) {
        this.id = id
        this.details = el
        this.restaurantName = el.restaurantName
        this.lat = el.lat
        this.lng = el.long
        this.ratings = el.ratings
        this.descRendered = false
        this.rate = this.calcRate()
        this.desc = this.displayShortCard()
        this.marker = new google.maps.Marker({ position: { lat: this.lat, lng: this.lng }, animation: google.maps.Animation.DROP, map: map, title: this.restaurantName, icon: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png", url: `#${this.id}` });
        this.addMarkerListener()
    }
    addMarkerListener(){
        google.maps.event.addListener(this.marker, 'click', function() {
            window.location.href = this.url;
          }); 
    }
    displayShortCard() {
        let titleBar = $.createElement("span"),
            div = $.createElement("div"),
            title = $.createElement("h5"),
            average = $.createElement('div')

        title.innerText = this.restaurantName

        titleBar.classList.add("d-flex", "justify-content-between")
        titleBar.append(title)

        average.innerHTML = this.rate + '&nbsp' + starSvg

        titleBar.append(average)

        div.classList.add('container-fluid', 'restaurantCard')
        div.append(titleBar)
        div.addEventListener('click', eventHandler)
        div.dataset.id = this.id
        div.id = this.id
        document.querySelector("#cardContainer").append(div)
    }
    renderDesc() {
        this.desc = $.createElement('p')

        let addRateBtn = $.createElement('button'),
            img = $.createElement('img'),
            a = $.createElement('a')

        a.target = '_blank'
        a.href = `https://maps.google.com/?cbll=${this.lat},${this.lng}&cbp=12,20.09,,0,5&layer=c`
        //img.src = '../api/streetview.jpg'
        img.src = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${this.lat},${this.lng}&heading=151.78&pitch=-0.76&key=AIzaSyCPL0ytHoiwfncMjqnKtANnbi0ukEDxBFI`

        a.append(img)
        this.desc.append(a)
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

                this.desc.append(rateCard)
            });
        }

        addRateBtn.innerText = 'Ajouter un avis'
        this.desc.append(addRateBtn)
        this.descRendered = true

    }
    calcRate() {
        let rate = 0
        if (this.ratings.length > 0) {
            this.ratings.forEach(rating => {
                rate += rating.stars
            });
            rate = rate / this.ratings.length
        } else {
            rate = '?'
        }
        return rate
    }
    toggleDesc(el) {
        if (!this.descRendered) {
            this.renderDesc()
            el.append(this.desc)
        } else if (el.childNodes.length > 1) {
            el.removeChild(el.childNodes[1])
        } else {
            el.append(this.desc)
        }
    }
    filterStars(min, max) {
        if (this.rate >= min && this.rate <= max) {
            this.displayShortCard()
            this.marker.setMap(map)
        } else {
            this.marker.setMap(null)
        }
    }
    addRate() {
        let el = $.querySelector(`div[data-id="${this.id}"]`),
            average = $.createElement('div'),
            comment = prompt('Quel est votre commentaire ?'),
            rate
        while (!_.isNumber(rate) || isNaN(rate) || rate < 1 || rate > 5) {
            rate = prompt('Quelle est votre note ?')
            rate = parseInt(rate)
            console.log(typeof (rate))
        }
        this.ratings.push({ stars: rate, comment: comment })
        this.renderDesc()

        this.rate = this.calcRate()
        el.firstChild.lastChild.remove()

        average.innerHTML = this.rate + '&nbsp' + starSvg

        el.firstChild.append(average)

        this.toggleDesc(el)
        this.toggleDesc(el)
    }
}
