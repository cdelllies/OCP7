class Restaurant {
    constructor(el, id) {
        this.id = id
        this.placeId = el.placeId
        this.details = el
        this.restaurantName = el.restaurantName
        this.lat = el.lat
        this.lng = el.lng
        this.reviews = el.ratings
        this.descRendered = false
        this.rate = el.rate
        this.nbRate = el.nbRate
        this.desc = this.displayShortCard()
        this.marker = new google.maps.Marker({ position: { lat: this.lat, lng: this.lng }, animation: google.maps.Animation.DROP, map: map, title: this.restaurantName, icon: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png", url: `#${this.id}` });
        this.addMarkerListener()
        this.roundRate(this.rate)
    }

    addMarkerListener() {
        google.maps.event.addListener(this.marker, 'click', function () {
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

        average.classList.add('rating')
        average.innerHTML = this.roundRate(this.rate)

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
        img.src = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${this.lat},${this.lng}&heading=151.78&pitch=-0.76&key=AIzaSyCPL0ytHoiwfncMjqnKtANnbi0ukEDxBFI`

        a.append(img)
        this.desc.append(a)
        this.desc.append($.createElement('h5').innerHTML = `Avis (${this.nbRate})`)
        this.desc.append($.createElement('br'))
        addRateBtn.innerText = 'Ajouter un avis'
        addRateBtn.classList.add('btn', 'btn-info')
        this.desc.append(addRateBtn)

        window.service.getDetails({ placeId: this.placeId, fields: ['review'] }, (res) => {
            console.log(res)
            res.reviews.forEach(el => {
                let obj = new Object
                obj.stars = el.rating
                obj.comment = el.text
                this.reviews.push(obj)
            })
            if (this.reviews.length > 0) {
                this.reviews.forEach(rating => {
                    let rateCard = $.createElement('article')
                    rateCard.classList.add('row', 'commentCard')

                    let comment = $.createElement('p')
                    comment.innerText = rating.comment
                    comment.classList.add('col-10')
                    rateCard.append(comment)

                    let stars = $.createElement('span')
                    stars.classList.add('rating')
                    stars.innerHTML = this.roundRate(rating.stars)
                    stars.classList.add('col-2', 'text-right')
                    rateCard.append(stars)

                    this.desc.append(rateCard)
                });
            }

            this.descRendered = true
        })


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
        if (comment == null) { return }
        while (!_.isNumber(rate) || isNaN(rate) || rate < 1 || rate > 5) {
            rate = prompt('Quelle est votre note ?')
            if (rate == null) { return }
            rate = parseInt(rate)
            console.log(typeof (rate))
        }
        this.reviews.push({ stars: rate, comment: comment })
        this.renderDesc()

        this.rate = this.calcRate()
        el.firstChild.lastChild.remove()

        average.innerHTML = this.rate + '&nbsp' + starSvg

        el.firstChild.append(average)

        this.toggleDesc(el)
        this.toggleDesc(el)
    }
    roundRate(rate) {
        let double = Math.round(rate * 2),
            stars = 0,
            halfStar = 0,
            str = ""
        if (double % 2) {
            stars = Math.floor(double / 2)
            halfStar = 1
        } else {
            stars = double / 2
        }
        for (let i = 0; i < stars; i++) {
            str += '●'
        }
        halfStar ? str += '◐' : 0
        while (str.length < 5) {
            str += '○'
        }
        return str
    }
}
