var request = require("request");

/**
 * Filter params
 */
const params = {
  // water, fire, earth, lightning, leave blank for any
  element: '',
  weaponStars: 5,
  minPrice: 0,
  maxPrice: 5,
  numOfPages: 4,
  pure: false
}

/**
 * Constants
 */
const STAT_MAP = {
  charisma: 'lightning',
  strength: 'fire',
  intelligenece: 'water',
  dexterity: 'earth'
};

showDate();
showItemSearchInfo();
getWeapons(buildRequestUrls());

function getWeapons(requestUrls) {
  requestUrls.forEach((url, i) => {
    setTimeout(() => {
      try {
        request.get(url, (error, response, body) => {  
          const itemList = JSON.parse(response.body);
          let result = [...itemList.results];
          console.log
          /**
           * Filter Price
           */
          result = result
            .filter(e => {
              const marketPrice = (e.price * 0.10) + e.price;
              return marketPrice >= params.minPrice && marketPrice <= params.maxPrice
            })
            .sort((w1, w2) => w1.price - w2.price);
        
          /**
           * Filter pure weapons
           */
          if (params.pure) {
            result = result.filter(e => e.weaponElement === STAT_MAP[e.stat1Element]);
        
            if (params.weaponStars >= 4) {
              result = result.filter(e => e.weaponElement === STAT_MAP[e.stat2Element]);
            }
        
            if (params.weaponStars === 5) {
              result = result.filter(e => e.weaponElement === STAT_MAP[e.stat3Element]);
            }
          }
          
          result = result
            .map(({weaponId, weaponElement, stat1Element, stat2Element, stat3Element, price}) => {
              const s1 = stat1Element.substring(0,3).toUpperCase();
              const s2 = stat2Element.substring(0,3).toUpperCase();
              const s3 = stat3Element.substring(0,3).toUpperCase();
              const element = weaponElement.substring(0,3).toUpperCase();
              return {
                i: weaponId,
                e: element,
                s: `${s1} ${s2} ${s3}`.trim(),
                p: (price + (price * 0.1)).toFixed(3)
              };
            });

          console.log(`Page ${i + 1}: `, result);
        }); 
      } catch (e) {
        console.log('Error retrieving records please try again after few seconds.')
      }
    }, i * 5000)
  });
}

function showDate() {
  let date = new Date();
  const day = date.toLocaleString('default', { day: '2-digit' });
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.toLocaleString('default', { year: 'numeric' });
  let hr = date.getHours();
  let min = date.getMinutes();
  let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  var ampm = "AM";
  if( hr > 12 ) {
      ampm = "PM";
  }

  console.log(`${month} ${day}, ${year} ${hr}:${min} ${ampm} ${tz}+${(new Date()).getTimezoneOffset()/60}`);
}

function showItemSearchInfo() {
  console.log(`Showing ${params.pure ? 'pure ' : ''}${params.weaponStars}* weapons (${!!params.element ? params.element : 'all'}), under ${params.maxPrice} SKILL.`);
}

function buildRequestUrls() {
  const urls = [];
  for (let currentPage = 1; currentPage <= params.numOfPages; currentPage++) {
    urls.push(`https://api.cryptoblades.io/static/market/weapon?element=${params.element}&minStars=${params.weaponStars}&maxStars=${params.weaponStars}&sortBy=&sortDir=&pageSize=60&pageNum=${currentPage - 1}`);
  }
  return urls;
}