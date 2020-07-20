const fs = require('fs')

const capitalize = (str, lower = false) =>
    (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
;

let raw = fs.readFileSync('data/dataset.json')

let json = JSON.parse(raw)

let places = []

json.forEach(el => {
    let obj = new Object
    obj.restaurantName = capitalize((el.fields.nomoffre).toLowerCase())
    obj.address = `${el.fields.adresse2}, ${el.fields.codepostal} ${el.fields.commune}`
    obj.lat = el.fields.latitude
    obj.long = el.fields.longitude
    obj.ratings = new Array
    places.push(obj)
});

let string = JSON.stringify(places)

fs.writeFileSync('data/places.json', string)