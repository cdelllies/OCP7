const fs = require('fs')

const capitalize = (str, lower = false) =>
    (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
;

const rand = (max, min = 0) => {
    return Math.floor(Math.random() * (max - min)) + min
}

let comment = [
    'Excellent restaurant, j\'ai apprécié le repas servi',
    'Très mauvaise expérience',
    'Le personnel est très sympathique et sait vous guider parmi les plats proposés',
    'Bonne cuisine',
    'Les couverts sont mal nettoyés, très déçu'
]

let raw = fs.readFileSync('dataConverter/dataset.json')

let json = JSON.parse(raw)

let places = []

json.forEach(el => {
    let obj = new Object
    obj.restaurantName = capitalize((el.fields.nomoffre).toLowerCase())
    obj.address = `${el.fields.adresse2}, ${el.fields.codepostal} ${el.fields.commune}`
    obj.lat = el.fields.latitude
    obj.long = el.fields.longitude
    obj.ratings = new Array
    for (let i = 0; i < rand(3, 1); i++) {
        let rating = new Object
        rating.stars = rand(5, 1)
        rating.comment = comment[rand(5)]
        obj.ratings.push(rating)
    }
    places.push(obj)
});

let string = JSON.stringify(places)

fs.writeFileSync('dataConverter/places.json', string)