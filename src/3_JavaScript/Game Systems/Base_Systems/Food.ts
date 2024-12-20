/*
. 8888888888                     888
. 888                            888
. 888                            888
. 8888888  .d88b.   .d88b.   .d88888
. 888     d88""88b d88""88b d88" 888
. 888     888  888 888  888 888  888
. 888     Y88..88P Y88..88P Y88b 888
. 888      "Y88P"   "Y88P"   "Y88888
.
*/

interface setupFood {
  eat: { (amt: number, type?: foodType): void };
  drink: { (drink: string): void };
  fastfood: { (place: string): string };
  bar: { (place: string): string };
  fast: object;
  drinkplace: object;
}


// NAMESPACE
if (setup.food === null || setup.food === undefined) {
  setup.food = {} as setupFood;
}
if (setup.drinks === null || setup.drinks === undefined) {
  setup.drinks = {} as object;
}

// eats food - adds to stats and applies effects
setup.food.eat = function(amt: number, type: foodType): void {
  aw.L();
  if (ↂ.pc.status.nutrition == null) {
    ↂ.pc.status.nutrition = {};
  }
  const ᛔ = ↂ.pc.status.nutrition;
  if (ᛔ[type] === null || ᛔ[type] === undefined) {
    ᛔ[type] = 0;
  }
  amt = Number(amt);
  ᛔ[type] += amt;
  aw.S();
  const bonus = random(1, 6);
  let x;
  switch (bonus) {
    case 1:
      setup.status.happy(1, "Eating some probably-unhealthy food");
      break;
    case 2:
    case 3:
    case 4:
      x = random(2, 4) * -1;
      setup.status.stress(x, "Enjoying some food");
      break;
    case 5:
      x = random(2, 4);
      setup.status.satisfact(x, "MMMMMMMMM Foooooood");
      break;
    case 6:
      setup.status.arousal(1);
      break;
  }
};

// drink drinks - adds to stats and applies effects
setup.food.drink = function(drink: string): void {
  if (setup.drinks[drink] !== null) {
    let effect = Math.round(setup.drinks[drink].strength - ↂ.pc.body.weight);
    if (effect < 1) {
      effect = 1;
    }
    ↂ.pc.status.alcohol += effect;
    if (ↂ.pc.status.pregnant) {
      setup.fert.fetusHealth(-3, "pc");
    }
    setup.drug.eatDrug("alc", setup.drinks[drink].strength);
    if (setup.drinks[drink].effects !== "none") {
      eval(setup.drinks[drink].effects);
    }
    if (setup.omni.matching("alcohol") === 0) {
      setup.omni.new("alcohol");
    }
    aw.S();
  } else {
    aw.con.warn("Drink was not found in setup.drinks!");
  }
};

// creates output for fastfood place
setup.food.fastfood = function(place: string): string {
  const ff = setup.food.fast[place];
  let output = `<div style="width:800px;text-align:center"><img data-passage="${ff.img}" style="border-radius:10px;display:inline-block;"><p style="text-align:justify;">${ff.desc}</p><h3>${ff.name} Menu</h3>`;
  const drinks = ["milkme", "starsucks"];
  const desserts = ["teattreats","happycream"];
  const time = 13 + random(0, 11);
  let cost = 4 + ff.cost;
  for (let i = 0, c = ff.menu.length; i < c; i++) {
    if (i === ff.menu.length - 1) { cost -= 1; }
    let type = "fast";
    if (drinks.includes(place)) { type = "drink"; }
    output += `<<button "ORDER">><<addTime ${time}>><<run setup.food.eat("${ff.amt}","${type}")>><<run aw.cash(${(cost * -1)}, "food");>><<run setup.refresh()>><<run Dialog.close()>><</button>><<tab>>${ff.menu[i]}<<tab>><span class="money">₢${cost}</span><br>`;
  }
  if (place === "burgertsar") {
    output += "<br><span class='note'>† cod-flavored semen, not actual cod semen.</span>";
  }
  output += "</div>";
  return output;
};
// creates output for bar place
setup.food.bar = function(place: string): string {
  const bb = setup.food.drinkplace[place];
  let output = `<div style="width:800px;text-align:center"><img data-passage="${bb.img}" style="border-radius:10px;display:inline-block;"><p style="text-align:justify;">${bb.desc}</p><h3>${bb.name} Menu</h3>`;
  const time = 7 + random(0, 11);
  for (let i = 0, c = bb.menu.length; i < c; i++) {
    if (setup.drinks[bb.menu[i]] !== null) {
    const cost = setup.drinks[bb.menu[i]].cost + bb.cost;
    const name = setup.drinks[bb.menu[i]].name;
    const desc = setup.drinks[bb.menu[i]].desc;
    output += `<<button "ORDER">><<addTime ${time}>><<run setup.food.drink("${bb.menu[i]}")>><<run aw.cash(${cost}, "food");>><<run setup.refresh()>><<run Dialog.close()>><</button>><<tab>>${name}<<tab>><span class="money">₢${cost}</span><br><span style="font-size:smaller">${desc}</span><br>`;
    } else {
      aw.con.warn("Drink was not found in setup.drinks!");
    }
  }
  output += "</div>";
  return output;
};
// fastfood
setup.food.fast = {
  mcdongalds: {
    name: "McDongald's",
    desc: "The fast food franchise that started it all, McDongald's has locations all over the globe. Many of their menu items feature their not-so-secret sauce--the creamy white Dong Sauce--such as the famous double-decker Big Dong cheeseburger.",
    menu: ["Big Dong Value Meal", "Double Donger Value Meal", "Happy Dong Meal"],
    cost: 2,
    img: "IMG-Restaurant-McDongalds",
    amt: 20,
  },
  burgertsar: {
    name: "Burger Tsar",
    desc: "The Russian entry into the world of fast food hasn't been very successful, at least in terms of selling food. After the government shut down the money laundering operation, the franchise has been facing a slow decline. Access to some Russian favorites such as cod semen soup and Kvass 'beverage' have kept the remaining locations in business.",
    menu: ["Tsar Burger Meal", "Ivan Blin Plate", "Cod Semen Soup†", "Borscht with Salty Meat Jello"],
    cost: 2,
    img: "IMG-Restaurant-BurgerTsar",
    amt: 20,
  },
  genghis: {
    name: "Genghis Mons",
    desc: "A fairly generic take on Mongolian barbecue, with the exception of certain stylistic elements and certain flavors added in to spice things up.",
    menu: ["Mound of Mons Plate", "Spread Lips Stir Fry"],
    cost: 4,
    img: "IMG-Restaurant-GenghisMons",
    amt: 30,
  },
  milkme: {
    name: "Milkme In A Cup",
    desc: "Drink fads like smoothies, juicing, boba tea, protein juice and others have come and gone over the years. Milkme arose from the ashes to serve a rather eclectic mix of past hits with a modern spin from the current Bull Milk™ fad.",
    menu: ["Tropical Fruit Milk Smoothie", "Melon Milk Cooler", "Berry Green Tea with Milk-Burst Boba,", "Bull Milk™ Fro-Yo Shake"],
    cost: 0,
    img: "IMG-Restaurant-MilkMe",
    amt: 10,
  },
  sbarfo: {
    name: "Sbarfo",
    desc: "The rather inexplicable pseudo-Italian cuisine location found in malls everywhere, and just about nowhere else. A staple of malls for over 40 years, Sbarfo seems to blend in seamlessly with the food court environment. Many people aren't even aware that their own local mall contains a Sbarfo! Despite this seeming handicap, this food-court-staple shows no sign of going anywhere.",
    menu: ["Generic Pizza Slice", "Pasta with Red Sauce", "Pasta with White Sauce", "Casu Marzu Poppers"],
    cost: 3,
    img: "IMG-Restaurant-Sbarfo",
    amt: 20,
  },
  tacohell: {
    name: "Taco Hell",
    desc: "A story of innovation and waste reduction that spread around the country, Taco Hell can convert all manner of things into something vaguely resembling Mexican cuisine. Taco Hell is no mere joke, as the level of spiciness ranges from <i>Insane Volcano</i> to <i>Potentially Deadly</i>. Fans rave that the food is an experience, one that doesn't just because you've finished eating.",
    menu: ["9-Hells Taco Meal", "Beef Coño Bowl", "Juicy Fish Taco Meal", "Salty Pene Churro"],
    cost: 1,
    img: "IMG-Restaurant-TacoHell",
    amt: 20,
  },
  teattreats: {
    name: "Teat Treats",
    desc: "Pretty-much exactly like older ice cream parlors, but focusing on breast-milk-based icecream and products. The switch to human milk emphasizes its natural healthiness, but the real reason of course is the epidemic of cow rage disease.",
    menu: ["Teat Icecream Cone", "Teat Frozen Yogurt", "Banana Teats Milk"],
    cost: 1,
    img: "IMG-Restaurant-TeatTreats",
    amt: 20,
  },
  happycream: {
    name: "Happy Cream",
    desc: "The most popular doughnuts restaurant chain in the country. It seems local branch has some unique flavors made specifically for the Appletree. This is not unusual since you remember visiting Happy Cream back in the days in the city; they had specialties there too.",
    menu: ["Surprise shell", "Glaze ring", "Appletree ring", "Creamy shell"],
    cost: 2,
    img: "IMG-Restaurant-HappyCream",
    amt: 20,
  },
  nachodaddy: {
    name: "Nacho Daddy",
    desc: "Mexican food place serving various southern cuisine. It is a pretty calm here and you wonder if Mexican food is popular in Appletree at all or is it a price that shoes away the potential customers.",
    menu: ["Jalapeno Nachos", "Jalapeno++ Nachos", "Taco basket", "Blue corn quesadilla"],
    cost: 4,
    img: "IMG-Restaurant-NachoDaddy",
    amt: 20,
  },
  goldenshower: {
    name: "Golden Shower",
    desc: "Asian restaurant serving all kinds of oriental cuisine. Most of the dishes are named in Vietnamese or Thai and there is no pictures on the menu so you really don't have any idea what they are about.",
    menu: ["Fo Soup", "Bahn Bao", "Goi Tom Ga", "Tom Chien Su", "Tom yam", "Chyoi Tam Bot"],
    cost: 1,
    img: "IMG-Restaurant-GoldenShower",
    amt: 20,
  },
  fukmi: {
    name: "Fuk Mi",
    desc: "The only Japanese place in town have mostly adapted sushi and sashimis. Not very popular especially since the place doesn't seems to be all tidy and clean.",
    menu: ["Philadelphia rolls", "California rolls", "Dragon rolls", "Ebi tempura", "Ohayogozaimas rolls"],
    cost: 2,
    img: "IMG-Restaurant-Fukmi",
    amt: 20,
  },
  olddongho: {
    name: "Old Dong Ho",
    desc: "Seafood and wok restaurant is dark and noisy. Prices on the chalkboard menu above the bar looks pretty cheap and the big sign says 'We guarantee good quality! No complains on quality for more than 10 years!'",
    menu: ["Tentacle noodles", "Mermaid's purse wok", "Ctu Lu Chu wok", "Fried fugu fish"],
    cost: 1,
    img: "IMG-Restaurant-OldDongHo",
    amt: 20,
  },
  udderdelights: {
    name: "Udder Delights",
    desc: "Fancy bakery serving pricey cakes made with natural hucow milk. It is a pretty rare product even in the Appletree.",
    menu: ["Cacao Croissants", "Butter cake", "Yeast cake", "Raspberry Pie"],
    cost: 3,
    img: "IMG-Restaurant-UdderDelights",
    amt: 20,
  },
  cockofthewalk: {
    name: "Cock of the Walk",
    desc: "Southern cuisine place with lots of specific regional food. It seems over last years good ol' south developed a pretty weird menu of remixed traditional dishes.",
    menu: ["Stepdaughter's delight", "Fried Chicken", "Pork and Ham", "Hoppin' John"],
    cost: 2,
    img: "IMG-Restaurant-CockoftheWalk",
    amt: 20,
  },
  hotporking: {
    name: "Hot Porking",
    desc: "This BBQ-focused restaurant has a wide selection of grilled meat seasoned in various ways. The smell is just majestic.",
    menu: ["Grilled Bratwurst", "Medium Rare Stakes", "Well-done Stakes", "Grilled patties"],
    cost: 2,
    img: "IMG-Restaurant-HotPorking",
    amt: 20,
  },
  remplir: {
    name: "Remplir L'uterus",
    desc: "This BBQ-focused restaurant has a wide selection of grilled meat seasoned in various ways. The smell is just majestic.",
    menu: ["Frog legs lasagna", "Cuisses de salope", "Jacques Lameloise"],
    cost: 18,
    img: "IMG-Restaurant-Remplir-Luterus",
    amt: 15,
  },
  peter: {
    name: "Grand Peter's Halfway Inn",
    desc: "This BBQ-focused restaurant has a wide selection of grilled meat seasoned in various ways. The smell is just majestic.",
    menu: ["Prairy oysters", "Rare Stakes", "Ceviche with Peruvian Black Mint", "Larb Salmon Ceviche"],
    cost: 16,
    img: "IMG-GrandPetersHalfwayInn",
    amt: 17,
  },
  starsucks: {
    name: "Starsucks Coffee",
    desc: "While Starsucks Coffee has been around for ages, it's only recently that they've started promoting the use of natural breast milk in their coffee-flavored beverages. The classic circular brand logo remains, but is now surrounded by a drop of fresh milk.",
    menu: ["大 Latte", "大 Fappacino", "大 Machiato", "中 Spermiatto"],
    cost: 2,
    img: "IMG-Restaurant-Starsucks",
    amt: 20,
  },
  lakefront: {
    name: "Lakefront Restaurant",
    desc: "The cozy place on the shore of the Clitea lake. Serving mostly seafood which is pretty ridiculous to think of — nearest sea is hundreds miles away.",
    menu: ["Shrimp plate", "Baked salmon", "Trout plate", "Octopus lasagna"],
    cost: 3,
    img: "IMG-Restaurant-lakefront",
    amt: 20,
  },
};

setup.food.drinkplace = {
  shakepop: {
    name: "Shake & pop",
    desc: "The prices are ridiculously high but it is pretty usual for bars in clubs like this. It seems they have a large selection of cocktail though.",
    menu: ["fickenmeister", "beer", "cocktail"],
    cost: 8,
    img: "IMG-ShakePopBar",
  },
  pollrider: {
    name: "Poll riders",
    desc: "The prices are pretty standard for such place and the variety is pretty good.",
    menu: ["fickenmeister", "beer", "beerGrunwald", "cocktail", "priceyWine", "vodka"],
    cost: 4,
    img: "IMG-PollRidersBar",
  },
  hindenburger: {
    name: "Hinden Burger",
    desc: "The bierhouse has wide range of beers, a lot of imported ones too.",
    menu: ["beerKoelsh", "beerGrunwald", "beer"],
    cost: 2,
    img: "IMG-HindenBurgerBar",
  },
  parkStand: {
    name: "Park refreshment stand",
    desc: "Some cold drink are sold here but the choice is rather small.",
    menu: ["limonade", "coke", "beer", "milkshake"],
    cost: 1,
    img: "IMG-RefreshmentStand",
  },
  beachBar: {
    name: "Beach Bar",
    desc: "Cold drinks and some cocktails are sold here.",
    menu: ["limonade", "coke", "beer", "margarita"],
    cost: 2,
    img: "IMG-BeachBar",
  },
  wrench: {
    name: "Wrench bar",
    desc: "The bar here has a wide choice of various drinks and if one's able to justify spending a little fortune on drinking here it can be considered a good bar.",
    menu: ["limonade", "coke", "spermoff", "beer", "cocktail", "margarita"],
    cost: 8,
    img: "IMG-WrenchBar",
  },
};

setup.drinks = {
  fickenmeister: {
    key: "fickenmeister",
    name: "Fickenmeister liqueur",
    desc: "Worldwide known German liqueur which top-secret recipe contains more than 30 ingredients. The only known ones are anise and the extract of arousal beans. 42%",
    cost: 10,
    strength: 7,
    effects: "none",
  },
  spermoff: {
    key: "spermoff",
    name: "Spermoff vodka",
    desc: "From the far Siberian planes beyond mighty Ural mountains this clear liquor was masterfully crafted from wood crop cuts by convicts. The premium export product with extremely low rate of blindness causes. 40%",
    cost: 5,
    strength: 40,
    effects: "none",
  },
  beer: {
    key: "beer",
    name: "Spirit of Wisconsin",
    desc: "Some beer from Wisconsin. Seems containing 6% of alcohol.",
    cost: 4,
    strength: 4,
    effects: "none",
  },
  beerKoelsh: {
    key: "beerKoelsh",
    name: "Koelsh beer",
    desc: "Imported German beer. 6% of alcohol.",
    cost: 5,
    strength: 4,
    effects: "none",
  },
  beerGrunwald: {
    key: "beerGrunwald",
    name: "Grunwald beer",
    desc: "Imported German beer. 6% of alcohol.",
    cost: 3,
    strength: 4,
    effects: "none",
  },
  priceyWine: {
    key: "priceyWine",
    name: "Sangue vergine",
    desc: "Italian 2018 vintage wine, pretty pricey option to get drunk. 12.5%",
    cost: 32,
    strength: 5,
    effects: "none",
  },
  cocktail: {
    key: "cocktail",
    name: `"Moisturizer" cocktail`,
    desc: "Famous coctail with white rum, vodka, juice and prairy oysters extract. 11%",
    cost: 12,
    strength: 5,
    effects: "none",
  },
  vodka: {
    key: "vodka",
    name: `Vodka "Spermoff"`,
    desc: "The most effective way to get shitfaced, a lot of alcohol mixed with water and a bit of a sugar. 40%",
    cost: 6,
    strength: 7,
    effects: "none",
  },
  moonshine: {
    key: "moonshine",
    name: `Moonshine"`,
    desc: "Home-brewed liquor. 40%",
    cost: 6,
    strength: 7,
    effects: "none",
  },
  limonade: {
    key: "limonade",
    name: `Lemonade"`,
    desc: "Refreshing non-alcoholic beverage.",
    cost: 2,
    strength: 0,
    effects: "none",
  },
  coke: {
    key: "coke",
    name: `Insti-Cola"`,
    desc: "Local coke, tastes the same as any other coke. This particular brand seems to be produced by Thornton Institute food branch.",
    cost: 3,
    strength: 0,
    effects: `
    ↂ.pc.status.bimbo += 1;
    setup.status.record("bimbo", 1, "Drinking an Insti-Cola");
    aw.S();
    `,
  },
  margarita: {
    key: "margarita",
    name: `Margarita"`,
    desc: "Popular beach cocktail, pretty refreshing.",
    cost: 4,
    strength: 4,
    effects: `
    ↂ.pc.status.stress -= 3;
    setup.status.record("stress", -3, "Refreshing cocktail at the beach bar");
    aw.S();
    `,
  },
  milkshake: {
    key: "milkshake",
    name: `Milkshake"`,
    desc: "Natural hucow milk vanilla-flavored milkshake.",
    cost: 4,
    strength: 0,
    effects: `
      ↂ.pc.status.bimbo++;
      setup.status.record("bimbo", 1, "A peculiar hucow-milkshake");
      aw.S();
    `,
  },

  // Anenn Markup
  milkyWhiskey: {
    key: "milkyWhiskey",
    name: `Milky-whiskey"`,
    desc: "A very particular and strong drink for the cowgirls, for their parties at the ranch. Produced with much love with their own milk!",
    cost: 20,
    strength: 6,
    effects: `
      ↂ.pc.status.arousal += 5;
      ↂ.pc.status.bimbo += 2;
      setup.status.record("bimbo", 2, "An alcoholic hucow milk concoction");
      aw.S();
    `,
  },
  bullVirility: {
    key: "bullVirility",
    name: `Bull virility pill"`,
    desc: "The manufacture of this drink is somewhat mysterious, although the taste is mild with the strong odor that resembles a male smell.",
    cost: 15,
    strength: 5,
    effects: `
      ↂ.pc.status.arousal += 3;
      aw.S();
    `,
  },
};
