/**
 * Comprehensive seed catalog of niche EU foods. Roughly 500 items chosen for
 * being recognisable to diaspora users — the kind of thing a Polish nurse in
 * Munich, a Greek bartender in Lisbon, or an Estonian designer in Stockholm
 * would type into the search bar before anything else.
 *
 * The catalog is intentionally biased toward "you can't easily find this in
 * a regular EU supermarket outside its origin country". Items grow via the
 * admin UI; this is just the v1 seed.
 */

export interface FoodItemSeed {
  slug: string;
  name: string;
  aka?: string[];
  originCountryIso2: string;
  categorySlug: string;
  brandSlug?: string;
  description: string;
  tags?: string[];
}

export const FOOD_ITEMS: FoodItemSeed[] = [
  // =========================================================================
  // POLAND
  // =========================================================================
  { slug: 'krowki-mleczne', name: 'Krówki Mleczne', aka: ['Polish fudge', 'milk fudge'], originCountryIso2: 'PL', categorySlug: 'candies', description: 'Soft milk-fudge squares wrapped in waxy paper — the cow on the wrapper is a Polish childhood fixture.', tags: ['nostalgic', 'childhood'] },
  { slug: 'ptasie-mleczko', name: 'Ptasie Mleczko', aka: ['bird\u2019s milk'], originCountryIso2: 'PL', categorySlug: 'chocolates', brandSlug: 'wedel', description: 'Marshmallow-light vanilla soufflé enrobed in dark chocolate. Wedel\u2019s 1936 invention.' },
  { slug: 'wedel-mieszanka', name: 'Mieszanka Wedlowska', originCountryIso2: 'PL', categorySlug: 'chocolates', brandSlug: 'wedel', description: 'The legendary tin of assorted Wedel pralines.' },
  { slug: 'michalki', name: 'Michałki', originCountryIso2: 'PL', categorySlug: 'chocolates', description: 'Peanut-and-cocoa-cream pralines in a crackly chocolate shell.' },
  { slug: 'prince-polo', name: 'Prince Polo', originCountryIso2: 'PL', categorySlug: 'biscuits', description: 'Chocolate-covered wafer beloved across Poland and oddly cult-status in Iceland.' },
  { slug: 'delicje', name: 'Delicje', originCountryIso2: 'PL', categorySlug: 'biscuits', description: 'Sponge biscuits with fruit jelly under a chocolate dome.' },
  { slug: 'kabanos', name: 'Kabanos', originCountryIso2: 'PL', categorySlug: 'cured-meats', description: 'Long, thin, smoky pork sticks. Snap them like a stick.' },
  { slug: 'kielbasa-krakowska', name: 'Kiełbasa Krakowska', originCountryIso2: 'PL', categorySlug: 'cured-meats', description: 'Coarse-cut, garlicky, lightly-smoked Krakow ham sausage.' },
  { slug: 'poledwica-sopocka', name: 'Polędwica Sopocka', originCountryIso2: 'PL', categorySlug: 'cured-meats', description: 'Smoked, brined pork loin from the Sopot region — pale pink, juicy.' },
  { slug: 'smalec', name: 'Smalec', originCountryIso2: 'PL', categorySlug: 'pate-aspic', description: 'Rendered pork lard with cracklings, onion and apple — for rye bread.' },
  { slug: 'sernik-mix', name: 'Sernik (cheesecake mix)', originCountryIso2: 'PL', categorySlug: 'baked', description: 'Polish twaróg cheesecake — denser, less sweet than NY style.' },
  { slug: 'pierogi-frozen', name: 'Pierogi (frozen, assorted)', originCountryIso2: 'PL', categorySlug: 'frozen', description: 'Ruskie, mięsne, z kapustą i grzybami — assorted dumplings.' },
  { slug: 'bigos', name: 'Bigos', originCountryIso2: 'PL', categorySlug: 'ready-meals', description: 'Hunter\u2019s stew of sauerkraut, fresh cabbage and assorted meats.' },
  { slug: 'zurek-mix', name: 'Żurek (sour rye soup mix)', originCountryIso2: 'PL', categorySlug: 'ready-meals', description: 'Bottled fermented rye starter for the iconic sour soup.' },
  { slug: 'oscypek', name: 'Oscypek', originCountryIso2: 'PL', categorySlug: 'cheese-dairy', description: 'Smoked Tatra sheep cheese, spindle-shaped and protected origin.' },
  { slug: 'zubrowka', name: 'Żubrówka', originCountryIso2: 'PL', categorySlug: 'spirits-wine-beer', description: 'Bison-grass vodka — herbal, slightly vanilla.' },
  { slug: 'tymbark-juice', name: 'Tymbark fruit nectars', originCountryIso2: 'PL', categorySlug: 'soft-drinks', brandSlug: 'tymbark', description: 'Apple-blackcurrant, multifruit — the carton with the witticism under the cap.' },
  { slug: 'tatra-water', name: 'Tatra spring water', originCountryIso2: 'PL', categorySlug: 'soft-drinks', description: 'Mineral water from the Tatra range.' },
  { slug: 'paluszki', name: 'Paluszki', originCountryIso2: 'PL', categorySlug: 'biscuits', description: 'Salty stick crackers. Pub snack across Poland.' },
  { slug: 'oranzada', name: 'Oranżada', originCountryIso2: 'PL', categorySlug: 'soft-drinks', description: 'Sparkling orangeade in glass bottles — pure 70s nostalgia.' },
  { slug: 'serki-homogenizowane', name: 'Serki Homogenizowane', originCountryIso2: 'PL', categorySlug: 'cheese-dairy', description: 'Sweet whipped quark cups — vanilla, strawberry, chocolate.' },
  { slug: 'kremowka', name: 'Kremówka', originCountryIso2: 'PL', categorySlug: 'baked', description: 'Custard cream slice between puff pastry. The pope\u2019s favourite, allegedly.' },
  { slug: 'paczki', name: 'Pączki', originCountryIso2: 'PL', categorySlug: 'baked', description: 'Yeast doughnuts filled with rose-hip jam.' },

  // =========================================================================
  // GERMANY
  // =========================================================================
  { slug: 'leberwurst', name: 'Leberwurst', aka: ['liverwurst'], originCountryIso2: 'DE', categorySlug: 'pate-aspic', description: 'Spreadable liver sausage. Smooth, coarse, with onion or marjoram — many variants.' },
  { slug: 'bratwurst', name: 'Bratwurst', originCountryIso2: 'DE', categorySlug: 'cured-meats', description: 'Pan-fried fresh pork sausage. Nuremberg, Thüringer, Frankfurter — pick a region.' },
  { slug: 'currywurst-gewuerz', name: 'Currywurst-Gewürz', originCountryIso2: 'DE', categorySlug: 'sauces-spices', description: 'The curry-paprika spice blend that makes Berlin\u2019s street snack.' },
  { slug: 'sauerkraut-de', name: 'Sauerkraut (jarred)', originCountryIso2: 'DE', categorySlug: 'pickles-preserves', description: 'Properly fermented cabbage, not the canned-vinegar kind.' },
  { slug: 'quark', name: 'Quark', originCountryIso2: 'DE', categorySlug: 'cheese-dairy', description: 'Fresh curd cheese — staple of German baking and breakfast.' },
  { slug: 'spaetzle', name: 'Spätzle', originCountryIso2: 'DE', categorySlug: 'pantry', description: 'Swabian egg-noodle dumplings. Buy fresh or dry.' },
  { slug: 'brezel', name: 'Brezel / Pretzel', originCountryIso2: 'DE', categorySlug: 'baked', description: 'Lye-bath pretzel — crackly, chewy, deeply browned.' },
  { slug: 'lebkuchen', name: 'Lebkuchen', originCountryIso2: 'DE', categorySlug: 'biscuits', description: 'Spiced Nuremberg honey cake. Christmas in a tin.' },
  { slug: 'marzipan-luebeck', name: 'Lübecker Marzipan', originCountryIso2: 'DE', categorySlug: 'candies', description: 'Almond-rich marzipan with the iconic city seal.' },
  { slug: 'maultaschen', name: 'Maultaschen', originCountryIso2: 'DE', categorySlug: 'frozen', description: 'Swabian filled pasta pockets — \u201cmeat in a hat\u201d.' },
  { slug: 'rote-gruetze', name: 'Rote Grütze', originCountryIso2: 'DE', categorySlug: 'pickles-preserves', description: 'Red-berry compote — eaten cold with vanilla sauce.' },
  { slug: 'bahlsen-leibniz', name: 'Bahlsen Leibniz Butterkeks', originCountryIso2: 'DE', categorySlug: 'biscuits', brandSlug: 'bahlsen', description: 'The 52-tooth butter biscuit invented in 1891.' },
  { slug: 'haribo-classic', name: 'Haribo Goldbären', originCountryIso2: 'DE', categorySlug: 'candies', brandSlug: 'haribo', description: 'The original German goldbear recipe — chewier than US.' },
  { slug: 'haribo-color-rado', name: 'Haribo Color-Rado', originCountryIso2: 'DE', categorySlug: 'candies', brandSlug: 'haribo', description: 'Mixed bag with the long licorice-and-fruit twists.' },
  { slug: 'ritter-sport', name: 'Ritter Sport (variety)', originCountryIso2: 'DE', categorySlug: 'chocolates', brandSlug: 'ritter-sport', description: 'Square. Practical. Good. The German chocolate manifesto.' },
  { slug: 'fritz-kola', name: 'Fritz-Kola', originCountryIso2: 'DE', categorySlug: 'soft-drinks', description: 'High-caffeine cola in a stubby brown bottle. Hamburg-born.' },
  { slug: 'club-mate', name: 'Club-Mate', originCountryIso2: 'DE', categorySlug: 'soft-drinks', description: 'Yerba mate soft drink. The hacker fuel of Berlin.' },
  { slug: 'jagermeister', name: 'Jägermeister', originCountryIso2: 'DE', categorySlug: 'spirits-wine-beer', description: 'The 56-herb digestif. Best ice-cold.' },

  // =========================================================================
  // AUSTRIA
  // =========================================================================
  { slug: 'mannerschnitten', name: 'Manner Original Neapolitaner', originCountryIso2: 'AT', categorySlug: 'biscuits', brandSlug: 'manner', description: 'Hazelnut wafers in the unmistakable pink box.' },
  { slug: 'mozartkugel', name: 'Mozartkugel', originCountryIso2: 'AT', categorySlug: 'chocolates', brandSlug: 'mozartkugel', description: 'Pistachio marzipan and nougat enrobed in dark chocolate.' },
  { slug: 'sachertorte', name: 'Original Sachertorte', originCountryIso2: 'AT', categorySlug: 'baked', description: 'Vienna chocolate cake with apricot jam, dark chocolate glaze.' },
  { slug: 'pez', name: 'PEZ', originCountryIso2: 'AT', categorySlug: 'candies', description: 'The cube candies in collectable dispensers — invented in Vienna.' },
  { slug: 'almdudler', name: 'Almdudler', originCountryIso2: 'AT', categorySlug: 'soft-drinks', brandSlug: 'almdudler', description: 'Alpine-herb soda. The \u201cNational Drink\u201d.' },
  { slug: 'kaesekrainer', name: 'Käsekrainer', originCountryIso2: 'AT', categorySlug: 'cured-meats', description: 'Cheese-studded smoked sausage. Vienna sausage stand classic.' },

  // =========================================================================
  // NETHERLANDS
  // =========================================================================
  { slug: 'stroopwafel', name: 'Stroopwafels', originCountryIso2: 'NL', categorySlug: 'biscuits', description: 'Two thin waffle layers with caramel syrup between. Warm one over coffee.' },
  { slug: 'hagelslag', name: 'Hagelslag', aka: ['chocolate sprinkles'], originCountryIso2: 'NL', categorySlug: 'candies', brandSlug: 'venz', description: 'Real chocolate sprinkles for breakfast bread. Yes, breakfast.' },
  { slug: 'drop', name: 'Drop (zoute drop)', aka: ['salty licorice'], originCountryIso2: 'NL', categorySlug: 'candies', description: 'Black salty licorice — divisive, and the Dutch eat the most per capita.' },
  { slug: 'bitterballen', name: 'Bitterballen (frozen)', originCountryIso2: 'NL', categorySlug: 'frozen', description: 'Crispy beef ragout balls. Pub-snack royalty.' },
  { slug: 'speculaas', name: 'Speculaas', originCountryIso2: 'NL', categorySlug: 'biscuits', description: 'Spiced windmill biscuits, traditionally for Sinterklaas.' },
  { slug: 'gouda', name: 'Boerengouda (farm Gouda)', originCountryIso2: 'NL', categorySlug: 'cheese-dairy', description: 'Aged farm Gouda with crystals — a long way from yellow plastic.' },
  { slug: 'edam', name: 'Edam', originCountryIso2: 'NL', categorySlug: 'cheese-dairy', description: 'Mild, semi-hard Dutch cheese in red wax.' },
  { slug: 'frikandel', name: 'Frikandel (frozen)', originCountryIso2: 'NL', categorySlug: 'frozen', description: 'Skinless deep-fried sausage of mixed meats.' },
  { slug: 'poffertjes', name: 'Poffertjes', originCountryIso2: 'NL', categorySlug: 'baked', description: 'Tiny puffy pancakes with butter and powdered sugar.' },
  { slug: 'rookworst', name: 'Rookworst', originCountryIso2: 'NL', categorySlug: 'cured-meats', description: 'Smoked Dutch sausage — boil and slice into stamppot.' },
  { slug: 'kruidnoten', name: 'Kruidnoten', originCountryIso2: 'NL', categorySlug: 'biscuits', description: 'Tiny spiced cookies thrown by Sinterklaas.' },
  { slug: 'vla', name: 'Vla', originCountryIso2: 'NL', categorySlug: 'cheese-dairy', description: 'Smooth Dutch dessert custard, drinkable from the carton.' },

  // =========================================================================
  // BELGIUM
  // =========================================================================
  { slug: 'neuhaus-pralines', name: 'Neuhaus pralines', originCountryIso2: 'BE', categorySlug: 'chocolates', brandSlug: 'neuhaus', description: 'The original 1857 Brussels praline house.' },
  { slug: 'leonidas-pralines', name: 'Leonidas pralines', originCountryIso2: 'BE', categorySlug: 'chocolates', brandSlug: 'leonidas', description: 'Buttery Belgian pralines, fresh-counter style.' },
  { slug: 'pierre-marcolini', name: 'Pierre Marcolini chocolates', originCountryIso2: 'BE', categorySlug: 'chocolates', description: 'Bean-to-bar Brussels chocolate. The Hermès of pralines.' },
  { slug: 'lotus-speculoos', name: 'Lotus Biscoff (Speculoos)', originCountryIso2: 'BE', categorySlug: 'biscuits', brandSlug: 'lotus', description: 'The caramelised coffee biscuit — and the spread.' },
  { slug: 'cuberdon', name: 'Cuberdon (Neuzekes)', originCountryIso2: 'BE', categorySlug: 'candies', description: 'Purple raspberry cones, soft inside. Ghent street-cart classic.' },
  { slug: 'liege-waffles', name: 'Liège waffles', originCountryIso2: 'BE', categorySlug: 'baked', description: 'Pearl-sugar waffles with caramelised crust.' },
  { slug: 'brussels-waffles', name: 'Brussels waffles', originCountryIso2: 'BE', categorySlug: 'baked', description: 'Lighter, crisper rectangular waffles dusted with sugar.' },
  { slug: 'filet-americain', name: 'Filet Américain (préparé)', originCountryIso2: 'BE', categorySlug: 'pate-aspic', description: 'Belgian-style steak tartare spread.' },
  { slug: 'mattentaart', name: 'Mattentaart', originCountryIso2: 'BE', categorySlug: 'baked', description: 'Curd cheese tart from East Flanders.' },
  { slug: 'cote-dor-chocolade', name: 'Côte d\u2019Or chocolate', originCountryIso2: 'BE', categorySlug: 'chocolates', brandSlug: 'cote-dor', description: 'The everyday Belgian chocolate bar with the elephant.' },
  { slug: 'babelutten', name: 'Babelutten', originCountryIso2: 'BE', categorySlug: 'candies', description: 'Coastal butter-caramel candies from West Flanders.' },

  // =========================================================================
  // FRANCE
  // =========================================================================
  { slug: 'macarons', name: 'Macarons', originCountryIso2: 'FR', categorySlug: 'baked', description: 'Almond meringue shells with ganache — Pierre Hermé / Ladurée style.' },
  { slug: 'calissons', name: 'Calissons d\u2019Aix', originCountryIso2: 'FR', categorySlug: 'candies', description: 'Almond-and-melon lozenges from Aix-en-Provence.' },
  { slug: 'madeleines', name: 'Madeleines de Commercy', originCountryIso2: 'FR', categorySlug: 'baked', description: 'Shell-shaped sponge cakes — Proust\u2019s madeleine.' },
  { slug: 'canneles', name: 'Cannelés bordelais', originCountryIso2: 'FR', categorySlug: 'baked', description: 'Bordeaux rum-vanilla custard cakes with caramel crust.' },
  { slug: 'roquefort', name: 'Roquefort AOP', originCountryIso2: 'FR', categorySlug: 'cheese-dairy', description: 'Cave-aged sheep blue cheese — the original \u201cnoble blue\u201d.' },
  { slug: 'camembert', name: 'Camembert de Normandie AOP', originCountryIso2: 'FR', categorySlug: 'cheese-dairy', description: 'Raw-milk Norman bloomy-rind round in its wooden box.' },
  { slug: 'comte', name: 'Comté AOP', originCountryIso2: 'FR', categorySlug: 'cheese-dairy', description: 'Aged Jura cow\u2019s milk — caramel and walnut notes.' },
  { slug: 'reblochon', name: 'Reblochon AOP', originCountryIso2: 'FR', categorySlug: 'cheese-dairy', description: 'Savoyard washed-rind cheese — base of tartiflette.' },
  { slug: 'saucisson-sec', name: 'Saucisson sec', originCountryIso2: 'FR', categorySlug: 'cured-meats', description: 'Air-dried pork sausage — slice with a pocket knife.' },
  { slug: 'rosette-de-lyon', name: 'Rosette de Lyon', originCountryIso2: 'FR', categorySlug: 'cured-meats', description: 'Slow-cured large sausage — fine-grained, nutty.' },
  { slug: 'boudin-noir', name: 'Boudin noir', originCountryIso2: 'FR', categorySlug: 'cured-meats', description: 'Blood sausage with apple — pan-fry until the skin pops.' },
  { slug: 'andouillette', name: 'Andouillette', originCountryIso2: 'FR', categorySlug: 'cured-meats', description: 'Tripe sausage — divisive, beloved by purists.' },
  { slug: 'confit-de-canard', name: 'Confit de canard (jarred)', originCountryIso2: 'FR', categorySlug: 'pate-aspic', description: 'Duck legs cured then preserved in their own fat.' },
  { slug: 'foie-gras', name: 'Foie gras', originCountryIso2: 'FR', categorySlug: 'pate-aspic', description: 'Whole-lobe or terrine — the classic Périgord product.' },
  { slug: 'praluline', name: 'Praluline de Roanne', originCountryIso2: 'FR', categorySlug: 'baked', description: 'Brioche studded with pink pralines — Pralus invention.' },
  { slug: 'betises-de-cambrai', name: 'Bêtises de Cambrai', originCountryIso2: 'FR', categorySlug: 'candies', description: 'Mint-filled striped boiled sweets from Cambrai.' },
  { slug: 'carambar', name: 'Carambar', originCountryIso2: 'FR', categorySlug: 'candies', description: 'Caramel sticks with a joke on the wrapper.' },
  { slug: 'dragibus', name: 'Dragibus', originCountryIso2: 'FR', categorySlug: 'candies', brandSlug: 'haribo-fr', description: 'Chewy round candies in slightly-off neon colours.' },
  { slug: 'berlingots', name: 'Berlingots', originCountryIso2: 'FR', categorySlug: 'candies', description: 'Pyramid striped boiled sweets, often Carpentras style.' },
  { slug: 'speculoos-fr', name: 'Speculoos (FR)', originCountryIso2: 'FR', categorySlug: 'biscuits', description: 'France-side caramelised biscuit, often paired with coffee.' },
  { slug: 'bonne-maman', name: 'Bonne Maman conserves', originCountryIso2: 'FR', categorySlug: 'pickles-preserves', brandSlug: 'bonne-maman', description: 'The gingham-lid French jam icon.' },
  { slug: 'pastis', name: 'Pastis (Ricard / 51)', originCountryIso2: 'FR', categorySlug: 'spirits-wine-beer', description: 'Anise apéritif. Add water; watch it cloud.' },
  { slug: 'orangina', name: 'Orangina', originCountryIso2: 'FR', categorySlug: 'soft-drinks', description: 'The little bulb-shaped bottle with bits of orange pulp.' },

  // =========================================================================
  // ITALY
  // =========================================================================
  { slug: 'panettone', name: 'Panettone', originCountryIso2: 'IT', categorySlug: 'baked', description: 'Tall Milanese Christmas yeast bread with candied fruit.' },
  { slug: 'pandoro', name: 'Pandoro', originCountryIso2: 'IT', categorySlug: 'baked', description: 'Veronese star-shaped golden cake dusted with sugar.' },
  { slug: 'colomba-pasquale', name: 'Colomba Pasquale', originCountryIso2: 'IT', categorySlug: 'baked', description: 'Easter dove cake — almond-topped, citrus inside.' },
  { slug: 'torrone', name: 'Torrone', originCountryIso2: 'IT', categorySlug: 'candies', description: 'Honey-almond nougat — soft or hard, with or without chocolate.' },
  { slug: 'amaretti', name: 'Amaretti di Saronno', originCountryIso2: 'IT', categorySlug: 'biscuits', description: 'Crisp almond biscuits in coloured wrappers.' },
  { slug: 'baci-perugina', name: 'Baci Perugina', originCountryIso2: 'IT', categorySlug: 'chocolates', brandSlug: 'perugina', description: 'Hazelnut-cream filled chocolates with a love note inside.' },
  { slug: 'mortadella-bologna', name: 'Mortadella Bologna IGP', originCountryIso2: 'IT', categorySlug: 'cured-meats', description: 'Pink, pistachio-flecked cured pork from Bologna.' },
  { slug: 'bresaola-valtellina', name: 'Bresaola della Valtellina IGP', originCountryIso2: 'IT', categorySlug: 'cured-meats', description: 'Air-dried beef from the Alps — lean, lemony.' },
  { slug: 'speck-alto-adige', name: 'Speck Alto Adige IGP', originCountryIso2: 'IT', categorySlug: 'cured-meats', description: 'Dry-cured, lightly-smoked South Tyrolean ham.' },
  { slug: 'lardo-colonnata', name: 'Lardo di Colonnata IGP', originCountryIso2: 'IT', categorySlug: 'cured-meats', description: 'Marble-cured Tuscan back-fat. Slice paper-thin on warm bread.' },
  { slug: 'nduja', name: '\u2019Nduja di Spilinga', originCountryIso2: 'IT', categorySlug: 'cured-meats', description: 'Spreadable spicy Calabrian pork sausage.' },
  { slug: 'parmigiano-reggiano', name: 'Parmigiano-Reggiano DOP', originCountryIso2: 'IT', categorySlug: 'cheese-dairy', description: 'The king of cheese, aged 24-36+ months.' },
  { slug: 'pecorino-romano', name: 'Pecorino Romano DOP', originCountryIso2: 'IT', categorySlug: 'cheese-dairy', description: 'Salty aged sheep cheese — backbone of carbonara.' },
  { slug: 'burrata', name: 'Burrata di Andria', originCountryIso2: 'IT', categorySlug: 'cheese-dairy', description: 'Pulled mozzarella shell holding cream and stracciatella.' },
  { slug: 'taralli', name: 'Taralli', originCountryIso2: 'IT', categorySlug: 'biscuits', description: 'Ring-shaped Pugliese savoury biscuits with fennel.' },
  { slug: 'mulino-bianco', name: 'Mulino Bianco breakfast biscuits', originCountryIso2: 'IT', categorySlug: 'biscuits', brandSlug: 'mulino-bianco', description: 'The childhood breakfast tin: Macine, Pan di Stelle, Abbracci.' },
  { slug: 'limoncello', name: 'Limoncello di Sorrento', originCountryIso2: 'IT', categorySlug: 'spirits-wine-beer', description: 'Amalfi lemon zest macerated in alcohol — keep it ice-cold.' },
  { slug: 'aperol', name: 'Aperol', originCountryIso2: 'IT', categorySlug: 'spirits-wine-beer', description: 'Bitter-orange aperitivo. Three parts prosecco, two parts Aperol, one of soda.' },
  { slug: 'campari', name: 'Campari', originCountryIso2: 'IT', categorySlug: 'spirits-wine-beer', description: 'Crimson bitter aperitivo — the Negroni\u2019s spine.' },
  { slug: 'grappa', name: 'Grappa', originCountryIso2: 'IT', categorySlug: 'spirits-wine-beer', description: 'Pomace brandy — single-varietal, barrel-aged options abound.' },
  { slug: 'lavazza', name: 'Lavazza espresso', originCountryIso2: 'IT', categorySlug: 'tea-coffee', brandSlug: 'lavazza', description: 'The blue-tin Italian espresso staple.' },
  { slug: 'illy-coffee', name: 'illy 100% Arabica', originCountryIso2: 'IT', categorySlug: 'tea-coffee', brandSlug: 'illy', description: 'Trieste-roasted single-blend espresso in the silver tin.' },
  { slug: 'crodino', name: 'Crodino', originCountryIso2: 'IT', categorySlug: 'soft-drinks', description: 'Non-alcoholic bittersweet aperitivo.' },
  { slug: 'chinotto', name: 'Chinotto', originCountryIso2: 'IT', categorySlug: 'soft-drinks', description: 'Bittersweet citrus soda — adult cola.' },

  // =========================================================================
  // SPAIN
  // =========================================================================
  { slug: 'turron-jijona', name: 'Turrón de Jijona', originCountryIso2: 'ES', categorySlug: 'candies', brandSlug: 'el-almendro', description: 'Soft almond-honey nougat from Alicante.' },
  { slug: 'turron-alicante', name: 'Turrón de Alicante', originCountryIso2: 'ES', categorySlug: 'candies', brandSlug: 'el-almendro', description: 'Hard almond nougat with whole almonds.' },
  { slug: 'polvorones', name: 'Polvorones', originCountryIso2: 'ES', categorySlug: 'biscuits', description: 'Crumbly almond shortbread — Christmas Andalusian.' },
  { slug: 'mantecados', name: 'Mantecados', originCountryIso2: 'ES', categorySlug: 'biscuits', description: 'Lard-rich Andalusian shortbread cousin to polvorones.' },
  { slug: 'membrillo', name: 'Membrillo (dulce de)', originCountryIso2: 'ES', categorySlug: 'pickles-preserves', description: 'Quince paste — pair with Manchego.' },
  { slug: 'jamon-iberico', name: 'Jamón ibérico de bellota', originCountryIso2: 'ES', categorySlug: 'cured-meats', description: 'Acorn-fed black-hoof Iberian ham — the pinnacle.' },
  { slug: 'jamon-serrano', name: 'Jamón serrano', originCountryIso2: 'ES', categorySlug: 'cured-meats', description: 'Mountain-cured white-pig ham — everyday excellence.' },
  { slug: 'chorizo', name: 'Chorizo (dulce or picante)', originCountryIso2: 'ES', categorySlug: 'cured-meats', description: 'Paprika-cured pork sausage — sweet or spicy.' },
  { slug: 'morcilla-burgos', name: 'Morcilla de Burgos', originCountryIso2: 'ES', categorySlug: 'cured-meats', description: 'Rice-and-onion blood sausage — fry slices till crisp.' },
  { slug: 'sobrasada', name: 'Sobrasada de Mallorca IGP', originCountryIso2: 'ES', categorySlug: 'cured-meats', description: 'Spreadable spiced Mallorcan sausage.' },
  { slug: 'cecina', name: 'Cecina de León IGP', originCountryIso2: 'ES', categorySlug: 'cured-meats', description: 'Smoked, air-dried beef — leaner than bresaola.' },
  { slug: 'lomo-embuchado', name: 'Lomo embuchado', originCountryIso2: 'ES', categorySlug: 'cured-meats', description: 'Cured pork loin in paprika and garlic.' },
  { slug: 'pimenton-vera', name: 'Pimentón de la Vera DOP', originCountryIso2: 'ES', categorySlug: 'sauces-spices', description: 'Smoked paprika from Extremadura — sweet, bittersweet, hot.' },
  { slug: 'azafran', name: 'Spanish saffron', originCountryIso2: 'ES', categorySlug: 'sauces-spices', description: 'La Mancha threads — paella\u2019s soul.' },
  { slug: 'manchego', name: 'Manchego DOP', originCountryIso2: 'ES', categorySlug: 'cheese-dairy', description: 'Sheep cheese with the basket-weave rind. Curado, viejo, añejo.' },
  { slug: 'mahon', name: 'Mahón-Menorca DOP', originCountryIso2: 'ES', categorySlug: 'cheese-dairy', description: 'Cow cheese from Menorca — orange paprika rind.' },
  { slug: 'horchata-chufa', name: 'Horchata de chufa', originCountryIso2: 'ES', categorySlug: 'soft-drinks', description: 'Tigernut milk — Valencian summer.' },
  { slug: 'cola-cao-drink', name: 'Cola Cao', originCountryIso2: 'ES', categorySlug: 'soft-drinks', brandSlug: 'cola-cao', description: 'The yellow-tin cocoa drink. Childhood breakfast.' },
  { slug: 'aceitunas-gordal', name: 'Gordal olives', originCountryIso2: 'ES', categorySlug: 'pickles-preserves', description: 'Plump Sevillian table olives.' },
  { slug: 'patatas-bravas-sauce', name: 'Salsa brava', originCountryIso2: 'ES', categorySlug: 'sauces-spices', description: 'Smoky-paprika sauce for fried potatoes.' },

  // =========================================================================
  // PORTUGAL
  // =========================================================================
  { slug: 'pasteis-de-nata', name: 'Pastéis de nata (frozen)', originCountryIso2: 'PT', categorySlug: 'frozen', description: 'Custard tarts — bake from frozen for Lisbon-bakery results.' },
  { slug: 'bolo-rei', name: 'Bolo Rei', originCountryIso2: 'PT', categorySlug: 'baked', description: 'Christmas king cake with crystallised fruits.' },
  { slug: 'queijadas', name: 'Queijadas de Sintra', originCountryIso2: 'PT', categorySlug: 'baked', description: 'Tiny cheese-and-cinnamon tartlets.' },
  { slug: 'bacalhau', name: 'Bacalhau (salt cod)', originCountryIso2: 'PT', categorySlug: 'fish-seafood', description: 'Salt-cured cod — soak overnight before cooking.' },
  { slug: 'chourico-pt', name: 'Chouriço português', originCountryIso2: 'PT', categorySlug: 'cured-meats', description: 'Garlicky paprika sausage — flame at the table.' },
  { slug: 'alheira', name: 'Alheira de Mirandela IGP', originCountryIso2: 'PT', categorySlug: 'cured-meats', description: 'Bread-and-game smoked sausage — born of crypto-Jewish ingenuity.' },
  { slug: 'morcela-pt', name: 'Morcela', originCountryIso2: 'PT', categorySlug: 'cured-meats', description: 'Portuguese blood sausage with cumin and garlic.' },
  { slug: 'linguica', name: 'Linguiça', originCountryIso2: 'PT', categorySlug: 'cured-meats', description: 'Thinner, smokier paprika sausage.' },
  { slug: 'ginja', name: 'Ginja', originCountryIso2: 'PT', categorySlug: 'spirits-wine-beer', description: 'Sour-cherry liqueur — try in a chocolate cup.' },
  { slug: 'vinho-do-porto', name: 'Vinho do Porto', originCountryIso2: 'PT', categorySlug: 'spirits-wine-beer', description: 'Tawny, Ruby, LBV, Vintage — Douro\u2019s fortified wine.' },
  { slug: 'queijo-da-serra', name: 'Queijo da Serra da Estrela DOP', originCountryIso2: 'PT', categorySlug: 'cheese-dairy', description: 'Soft, runny sheep cheese — spoon out the centre.' },
  { slug: 'pao-de-lo', name: 'Pão de Ló', originCountryIso2: 'PT', categorySlug: 'baked', description: 'Egg-rich sponge cake — best slightly under-baked.' },
  { slug: 'compal-juice', name: 'Compal nectars', originCountryIso2: 'PT', categorySlug: 'soft-drinks', brandSlug: 'compal', description: 'Pear, peach, mango — the carton on every Portuguese table.' },
  { slug: 'sumol', name: 'Sumol', originCountryIso2: 'PT', categorySlug: 'soft-drinks', description: 'Pineapple-orange fizzy fruit drink.' },

  // =========================================================================
  // GREECE
  // =========================================================================
  { slug: 'loukoumi', name: 'Loukoumi', aka: ['Greek delight'], originCountryIso2: 'GR', categorySlug: 'candies', description: 'Rosewater-mastic gelée dusted in sugar.' },
  { slug: 'halva-gr', name: 'Greek halva (sesame or semolina)', originCountryIso2: 'GR', categorySlug: 'candies', description: 'Sesame paste with sugar, often with pistachio or cocoa.' },
  { slug: 'pasteli', name: 'Pasteli', originCountryIso2: 'GR', categorySlug: 'candies', description: 'Sesame-honey bars — ancient Greek snack.' },
  { slug: 'mastiha-chios', name: 'Mastiha of Chios PDO', originCountryIso2: 'GR', categorySlug: 'spirits-wine-beer', brandSlug: 'mastiha-shop', description: 'The famous resin from Chios — chew, drink (mastiha liqueur), or bake with.' },
  { slug: 'ouzo', name: 'Ouzo', originCountryIso2: 'GR', categorySlug: 'spirits-wine-beer', description: 'Anise spirit — a little water turns it cloudy and rounded.' },
  { slug: 'tsipouro', name: 'Tsipouro', originCountryIso2: 'GR', categorySlug: 'spirits-wine-beer', description: 'Pomace spirit, usually unflavoured (no anise).' },
  { slug: 'feta-pdo', name: 'Feta PDO', originCountryIso2: 'GR', categorySlug: 'cheese-dairy', description: 'Brined sheep (and sometimes goat) cheese — only Greek by law.' },
  { slug: 'graviera', name: 'Graviera', originCountryIso2: 'GR', categorySlug: 'cheese-dairy', description: 'Cretan or Naxos hard cheese — nutty.' },
  { slug: 'kefalotyri', name: 'Kefalotyri', originCountryIso2: 'GR', categorySlug: 'cheese-dairy', description: 'Hard, salty grating cheese.' },
  { slug: 'mizithra', name: 'Mizithra', originCountryIso2: 'GR', categorySlug: 'cheese-dairy', description: 'Fresh whey cheese — sweet or aged-dry varieties.' },
  { slug: 'trahanas', name: 'Trahanas', originCountryIso2: 'GR', categorySlug: 'pantry', description: 'Fermented wheat-and-milk soup base.' },
  { slug: 'krinos-olives', name: 'Kalamata olives', originCountryIso2: 'GR', categorySlug: 'pickles-preserves', description: 'Almond-shaped, dark purple, brined Peloponnese olives.' },
  { slug: 'greek-mountain-tea', name: 'Greek mountain tea (sideritis)', originCountryIso2: 'GR', categorySlug: 'tea-coffee', description: 'Wild ironwort flowers steeped to a herbal infusion.' },
  { slug: 'metaxa', name: 'Metaxa', originCountryIso2: 'GR', categorySlug: 'spirits-wine-beer', description: 'Brandy-and-wine blend — smooth and slightly sweet.' },
  { slug: 'dolmades', name: 'Dolmades (jarred)', originCountryIso2: 'GR', categorySlug: 'pickles-preserves', description: 'Stuffed vine leaves in oil and lemon.' },
  { slug: 'ion-amygdalou', name: 'ION Amygdalou', originCountryIso2: 'GR', categorySlug: 'chocolates', brandSlug: 'ion', description: 'Chocolate bar with whole almonds — Greek pantry classic.' },
  { slug: 'frigganies', name: 'Friggania', originCountryIso2: 'GR', categorySlug: 'biscuits', brandSlug: 'papadopoulos', description: 'Twice-baked rusks for breakfast and dakos.' },

  // =========================================================================
  // CYPRUS
  // =========================================================================
  { slug: 'halloumi-pdo', name: 'Halloumi PDO', originCountryIso2: 'CY', categorySlug: 'cheese-dairy', description: 'High-melting-point grilling cheese with mint — protected origin since 2021.' },
  { slug: 'soutzoukos', name: 'Soutzoukos', originCountryIso2: 'CY', categorySlug: 'candies', description: 'Almonds threaded on a string and dipped in grape-must syrup.' },
  { slug: 'commandaria', name: 'Commandaria', originCountryIso2: 'CY', categorySlug: 'spirits-wine-beer', description: 'Sun-dried-grape sweet wine — among the world\u2019s oldest named.' },
  { slug: 'zivania', name: 'Zivania', originCountryIso2: 'CY', categorySlug: 'spirits-wine-beer', description: 'Pomace spirit traditionally aged in oak.' },
  { slug: 'cy-loukoumi', name: 'Geroskipou Loukoumi PGI', originCountryIso2: 'CY', categorySlug: 'candies', description: 'Famous Cyprus version of loukoumi.' },

  // =========================================================================
  // MALTA
  // =========================================================================
  { slug: 'pastizzi', name: 'Pastizzi (frozen)', originCountryIso2: 'MT', categorySlug: 'frozen', description: 'Diamond-shaped puff pastries with ricotta or mushy peas.' },
  { slug: 'kinnie', name: 'Kinnie', originCountryIso2: 'MT', categorySlug: 'soft-drinks', brandSlug: 'kinnie', description: 'Bittersweet orange-and-herb soft drink.' },
  { slug: 'twistees', name: 'Twistees', originCountryIso2: 'MT', categorySlug: 'biscuits', brandSlug: 'twistees', description: 'Ring-shaped cheese-flavoured snacks. Pure Maltese childhood.' },
  { slug: 'imqaret', name: 'Imqaret', originCountryIso2: 'MT', categorySlug: 'baked', description: 'Date-filled pastry diamonds.' },
  { slug: 'helwa-tat-tork', name: 'Ħelwa tat-Tork', originCountryIso2: 'MT', categorySlug: 'candies', description: 'Maltese sesame-and-sugar halva slabs.' },
  { slug: 'hobz-bizzejt', name: 'Hobż biż-żejt fixings', originCountryIso2: 'MT', categorySlug: 'pantry', description: 'Crusty bread, kunserva, capers — the Maltese sandwich kit.' },

  // =========================================================================
  // CZECHIA
  // =========================================================================
  { slug: 'becherovka', name: 'Becherovka', originCountryIso2: 'CZ', categorySlug: 'spirits-wine-beer', description: 'Karlovy Vary herbal liqueur. The 13th healing spring.' },
  { slug: 'slivovice', name: 'Slivovice', originCountryIso2: 'CZ', categorySlug: 'spirits-wine-beer', description: 'Plum brandy — Moravian backbone.' },
  { slug: 'olomoucke-tvaruzky', name: 'Olomoucké tvarůžky PGI', originCountryIso2: 'CZ', categorySlug: 'cheese-dairy', description: 'Pungent ripened cheese in tiny rings — beloved and infamous.' },
  { slug: 'kofola', name: 'Kofola', originCountryIso2: 'CZ', categorySlug: 'soft-drinks', brandSlug: 'kofola', description: 'Czech-Slovak cola alternative — herbal, less sweet.' },
  { slug: 'tatranky', name: 'Tatranky', originCountryIso2: 'CZ', categorySlug: 'biscuits', brandSlug: 'opavia', description: 'Hazelnut wafer bars from the Tatra-themed range.' },
  { slug: 'horalky', name: 'Horalky', originCountryIso2: 'CZ', categorySlug: 'biscuits', brandSlug: 'sedita', description: 'Peanut wafers — every kid\u2019s pocket snack.' },
  { slug: 'studentska-pecet', name: 'Studentská pečeť', originCountryIso2: 'CZ', categorySlug: 'chocolates', brandSlug: 'orion', description: 'Chocolate with raisins, peanuts and jelly chunks.' },
  { slug: 'utopenec', name: 'Utopenec', originCountryIso2: 'CZ', categorySlug: 'pickles-preserves', description: 'Pickled sausage with onion — \u201cdrowned man\u201d. Pub classic.' },

  // =========================================================================
  // SLOVAKIA
  // =========================================================================
  { slug: 'bryndza', name: 'Slovenská Bryndza PGI', originCountryIso2: 'SK', categorySlug: 'cheese-dairy', description: 'Spreadable sheep cheese — base of bryndzové halušky.' },
  { slug: 'zincica', name: 'Žinčica', originCountryIso2: 'SK', categorySlug: 'cheese-dairy', description: 'Whey drink from sheep cheese-making.' },
  { slug: 'tatransky-caj', name: 'Tatranský čaj', originCountryIso2: 'SK', categorySlug: 'spirits-wine-beer', description: 'Herbal Tatra liqueur — \u201cmountain tea\u201d for adults.' },
  { slug: 'mila-wafer', name: 'Mila Wafer', originCountryIso2: 'SK', categorySlug: 'biscuits', brandSlug: 'sedita', description: 'Smooth nougat-cream wafer.' },

  // =========================================================================
  // HUNGARY
  // =========================================================================
  { slug: 'palinka', name: 'Pálinka', originCountryIso2: 'HU', categorySlug: 'spirits-wine-beer', description: 'Fruit brandy — apricot, plum, pear; the protected national spirit.' },
  { slug: 'tokaji-aszu', name: 'Tokaji Aszú', originCountryIso2: 'HU', categorySlug: 'spirits-wine-beer', description: 'Botrytised sweet wine — \u201cwine of kings\u201d.' },
  { slug: 'unicum', name: 'Unicum', originCountryIso2: 'HU', categorySlug: 'spirits-wine-beer', description: 'Bitter herbal liqueur in the round green bottle.' },
  { slug: 'edesnemes-paprika', name: 'Édesnemes paprika', originCountryIso2: 'HU', categorySlug: 'sauces-spices', description: '\u201cNoble sweet\u201d Szeged paprika — the everyday cooking grade.' },
  { slug: 'csemegepaprika', name: 'Csemegepaprika', originCountryIso2: 'HU', categorySlug: 'sauces-spices', description: 'Slightly sweeter, fruitier delicate-grade paprika.' },
  { slug: 'teli-szalami', name: 'Téli szalámi', originCountryIso2: 'HU', categorySlug: 'cured-meats', brandSlug: 'pick', description: 'Pick winter salami — long-cured, mould-rind.' },
  { slug: 'mangalica-products', name: 'Mangalica cured pork', originCountryIso2: 'HU', categorySlug: 'cured-meats', description: 'Curly-haired heritage pig — fat-marbled and intensely flavoured.' },
  { slug: 'turo-rudi', name: 'Túró Rudi', originCountryIso2: 'HU', categorySlug: 'cheese-dairy', description: 'Curd-cheese bar coated in chocolate. Refrigerated.' },
  { slug: 'pötyi', name: 'Pötyi', originCountryIso2: 'HU', categorySlug: 'biscuits', description: 'Tiny salty cracker dots.' },
  { slug: 'negro-candy', name: 'Negro', originCountryIso2: 'HU', categorySlug: 'candies', description: 'Black anise-menthol throat candies.' },
  { slug: 'sport-szelet', name: 'Sport szelet', originCountryIso2: 'HU', categorySlug: 'chocolates', description: 'Rum-cocoa filled chocolate bar — communist-era classic still going.' },
  { slug: 'gyori-keksz', name: 'Győri Édes biscuits', originCountryIso2: 'HU', categorySlug: 'biscuits', brandSlug: 'gyori-edes', description: 'Sweet vanilla biscuits — the Hungarian Petit-Beurre.' },
  { slug: 'lecso', name: 'Lecsó (jarred)', originCountryIso2: 'HU', categorySlug: 'pickles-preserves', description: 'Pepper-tomato-onion stew base.' },

  // =========================================================================
  // ROMANIA
  // =========================================================================
  { slug: 'cozonac', name: 'Cozonac', originCountryIso2: 'RO', categorySlug: 'baked', description: 'Sweet braided bread with walnut, cocoa or rahat (Turkish delight) filling.' },
  { slug: 'sarmale', name: 'Sarmale', originCountryIso2: 'RO', categorySlug: 'ready-meals', description: 'Cabbage rolls with rice and pork — the Sunday dish.' },
  { slug: 'mici-mix', name: 'Mici (mititei) mix', originCountryIso2: 'RO', categorySlug: 'cured-meats', description: 'Fresh, skinless grilled meat rolls — backyard summer.' },
  { slug: 'telemea', name: 'Telemea', originCountryIso2: 'RO', categorySlug: 'cheese-dairy', description: 'Brined white cheese, similar to feta, often sheep or goat.' },
  { slug: 'cascaval', name: 'Cașcaval', originCountryIso2: 'RO', categorySlug: 'cheese-dairy', description: 'Yellow semi-hard cheese — slice or grill.' },
  { slug: 'palinca-ro', name: 'Pălincă', originCountryIso2: 'RO', categorySlug: 'spirits-wine-beer', description: 'Strong (~52%) double-distilled fruit brandy from Transylvania.' },
  { slug: 'tuica', name: 'Țuică', originCountryIso2: 'RO', categorySlug: 'spirits-wine-beer', description: 'Romanian plum brandy — softer than pălincă.' },
  { slug: 'salam-de-sibiu', name: 'Salam de Sibiu PGI', originCountryIso2: 'RO', categorySlug: 'cured-meats', description: 'Long-cured pork salami with white mould rind.' },
  { slug: 'bulz', name: 'Bulz', originCountryIso2: 'RO', categorySlug: 'ready-meals', description: 'Polenta balls stuffed with cheese — shepherd food.' },
  { slug: 'malai', name: 'Mălai (cornmeal)', originCountryIso2: 'RO', categorySlug: 'pantry', description: 'Fine-ground cornmeal for mămăligă.' },
  { slug: 'magiun-de-prune', name: 'Magiun de prune', originCountryIso2: 'RO', categorySlug: 'pickles-preserves', description: 'Slow-cooked plum butter, sugar-free.' },
  { slug: 'covrigi', name: 'Covrigi', originCountryIso2: 'RO', categorySlug: 'baked', description: 'Romanian pretzels — softer, with sesame or poppy.' },
  { slug: 'eugenia', name: 'Eugenia', originCountryIso2: 'RO', categorySlug: 'biscuits', brandSlug: 'kandia', description: 'Cocoa-cream sandwich biscuits — every Romanian recess in the 90s.' },

  // =========================================================================
  // BULGARIA
  // =========================================================================
  { slug: 'sirene-bg', name: 'Sirene', originCountryIso2: 'BG', categorySlug: 'cheese-dairy', description: 'Bulgarian brined white cheese — saltier and crumblier than feta.' },
  { slug: 'kashkaval-bg', name: 'Kashkaval', originCountryIso2: 'BG', categorySlug: 'cheese-dairy', description: 'Yellow Balkan cheese — toast on bread for principa.' },
  { slug: 'lukanka', name: 'Lukanka', originCountryIso2: 'BG', categorySlug: 'cured-meats', description: 'Flat, air-dried, spiced pork-and-veal sausage.' },
  { slug: 'sudzhuk', name: 'Sudzhuk (Sujuk)', originCountryIso2: 'BG', categorySlug: 'cured-meats', description: 'Spiced beef sausage, sometimes pressed flat.' },
  { slug: 'banitsa', name: 'Banitsa (frozen)', originCountryIso2: 'BG', categorySlug: 'frozen', description: 'Layered phyllo with sirene and yogurt.' },
  { slug: 'lyutenitsa', name: 'Lyutenitsa', originCountryIso2: 'BG', categorySlug: 'pickles-preserves', description: 'Roasted-pepper-tomato spread, mild or hot.' },
  { slug: 'ayran', name: 'Ayran', originCountryIso2: 'BG', categorySlug: 'cheese-dairy', description: 'Salty cold yogurt drink.' },
  { slug: 'boza', name: 'Boza', originCountryIso2: 'BG', categorySlug: 'soft-drinks', description: 'Fermented millet drink — slightly tangy, slightly sweet.' },
  { slug: 'rose-jam', name: 'Rose petal jam', originCountryIso2: 'BG', categorySlug: 'pickles-preserves', description: 'From Kazanlak\u2019s damask roses.' },
  { slug: 'rose-loukum', name: 'Rose loukum', originCountryIso2: 'BG', categorySlug: 'candies', brandSlug: 'pobeda', description: 'Rose-perfumed Turkish-delight cubes dusted with sugar.' },

  // =========================================================================
  // CROATIA
  // =========================================================================
  { slug: 'prsut', name: 'Dalmatinski / Krčki pršut', originCountryIso2: 'HR', categorySlug: 'cured-meats', description: 'Air-cured Croatian ham, often bora-wind-dried on Krk.' },
  { slug: 'paski-sir', name: 'Paški sir PDO', originCountryIso2: 'HR', categorySlug: 'cheese-dairy', description: 'Aged Pag-island sheep cheese — sage-tinged from coastal grass.' },
  { slug: 'kulen', name: 'Slavonski kulen PDO', originCountryIso2: 'HR', categorySlug: 'cured-meats', description: 'Spicy paprika sausage from Slavonia — smoky, deep red.' },
  { slug: 'bajadera', name: 'Kraš Bajadera', originCountryIso2: 'HR', categorySlug: 'chocolates', brandSlug: 'kras', description: 'Layered nougat praline — Yugoslav-era confectionery icon.' },
  { slug: 'kras-griotte', name: 'Kraš Griotte', originCountryIso2: 'HR', categorySlug: 'chocolates', brandSlug: 'kras', description: 'Maraschino-cherry-filled chocolate.' },
  { slug: 'domacica', name: 'Kraš Domaćica', originCountryIso2: 'HR', categorySlug: 'biscuits', brandSlug: 'kras', description: 'The vanilla biscuit-tin staple.' },
  { slug: 'vegeta', name: 'Vegeta', originCountryIso2: 'HR', categorySlug: 'sauces-spices', brandSlug: 'podravka', description: 'The 1959 vegetable seasoning — the Balkan MSG-free umami shortcut.' },
  { slug: 'maraschino', name: 'Maraschino', originCountryIso2: 'HR', categorySlug: 'spirits-wine-beer', description: 'Marasca-cherry liqueur — clear, dry, perfumed.' },
  { slug: 'pelinkovac', name: 'Pelinkovac', originCountryIso2: 'HR', categorySlug: 'spirits-wine-beer', description: 'Bitter wormwood liqueur.' },
  { slug: 'rakija-hr', name: 'Rakija (Croatian)', originCountryIso2: 'HR', categorySlug: 'spirits-wine-beer', description: 'Šljivovica, lozovača, travarica — fruit brandies.' },

  // =========================================================================
  // SLOVENIA
  // =========================================================================
  { slug: 'kranjska-klobasa', name: 'Kranjska klobasa PDO', originCountryIso2: 'SI', categorySlug: 'cured-meats', description: 'Lightly-smoked pork sausage — boil and serve with mustard.' },
  { slug: 'idrijski-zlikrofi', name: 'Idrijski žlikrofi', originCountryIso2: 'SI', categorySlug: 'frozen', description: 'Mercury-mining-town potato dumplings, hat-shaped.' },
  { slug: 'karst-prsut', name: 'Kraški pršut PDO', originCountryIso2: 'SI', categorySlug: 'cured-meats', description: 'Karst plateau air-dried ham.' },
  { slug: 'kremsnita', name: 'Bled Kremšnita', originCountryIso2: 'SI', categorySlug: 'baked', description: 'Custard-cream-and-Chantilly slice from Lake Bled.' },

  // =========================================================================
  // ESTONIA
  // =========================================================================
  { slug: 'kama', name: 'Kama', originCountryIso2: 'EE', categorySlug: 'pantry', description: 'Roasted grain-and-pea flour mix — stir into kefir.' },
  { slug: 'kohuke', name: 'Kohuke', originCountryIso2: 'EE', categorySlug: 'cheese-dairy', description: 'Curd-cheese bar in chocolate — vanilla, kama, strawberry.' },
  { slug: 'vana-tallinn', name: 'Vana Tallinn', originCountryIso2: 'EE', categorySlug: 'spirits-wine-beer', description: 'Rum-based dark herbal liqueur.' },
  { slug: 'kalev-chocolate', name: 'Kalev chocolate', originCountryIso2: 'EE', categorySlug: 'chocolates', brandSlug: 'kalev', description: 'The 1806 Tallinn chocolate house.' },
  { slug: 'verivorst', name: 'Verivorst', originCountryIso2: 'EE', categorySlug: 'cured-meats', description: 'Estonian blood sausage — Christmas staple, fried with lingonberry.' },
  { slug: 'sult', name: 'Sült', aka: ['root jelly', 'aspic', 'meat jelly'], originCountryIso2: 'EE', categorySlug: 'pate-aspic', description: 'Pork-and-onion meat-jelly — set in its own gelatine.' },
  { slug: 'leivasupp', name: 'Leivasupp', originCountryIso2: 'EE', categorySlug: 'ready-meals', description: 'Sweet rye-bread soup with raisins.' },

  // =========================================================================
  // LATVIA
  // =========================================================================
  { slug: 'sklandrausis', name: 'Sklandrausis PGI', originCountryIso2: 'LV', categorySlug: 'baked', description: 'Rye-crust tartlets with potato and carrot — Courland heritage.' },
  { slug: 'rigas-sprotes', name: 'Rīgas Šprotes (smoked sprats)', originCountryIso2: 'LV', categorySlug: 'fish-seafood', description: 'Tin of smoked Baltic sprats in oil.' },
  { slug: 'riga-black-balsam', name: 'Riga Black Balsam', originCountryIso2: 'LV', categorySlug: 'spirits-wine-beer', description: 'Bitter black herbal liqueur in the ceramic bottle.' },
  { slug: 'laima-chocolate', name: 'Laima chocolate', originCountryIso2: 'LV', categorySlug: 'chocolates', brandSlug: 'laima', description: 'The 1870 Riga chocolate house.' },
  { slug: 'kvass', name: 'Kvass', originCountryIso2: 'LV', categorySlug: 'soft-drinks', description: 'Lightly-fermented rye-bread drink — barely alcoholic.' },
  { slug: 'karums', name: 'Karums curd cheese bars', originCountryIso2: 'LV', categorySlug: 'cheese-dairy', description: 'Sweetened curd dipped in chocolate.' },

  // =========================================================================
  // LITHUANIA
  // =========================================================================
  { slug: 'sakotis', name: 'Šakotis', originCountryIso2: 'LT', categorySlug: 'baked', description: 'Spit-baked spike-cake — wedding cake of the Baltic.' },
  { slug: 'skilandis', name: 'Skilandis PGI', originCountryIso2: 'LT', categorySlug: 'cured-meats', description: 'Smoked, cold-cured pork shoulder — eaten thinly sliced.' },
  { slug: 'cepelinai-mix', name: 'Cepelinai mix', originCountryIso2: 'LT', categorySlug: 'frozen', description: 'Zeppelin-shaped potato dumplings stuffed with meat.' },
  { slug: 'saltibarsciai-mix', name: 'Šaltibarščiai mix', originCountryIso2: 'LT', categorySlug: 'ready-meals', description: 'Cold pink beetroot soup base — summer in a bowl.' },
  { slug: 'trauktine', name: 'Trauktinė', originCountryIso2: 'LT', categorySlug: 'spirits-wine-beer', description: 'Honey-and-herb liqueur — \u201c999\u201d a famous one.' },
  { slug: 'ruta-chocolate', name: 'Rūta chocolate', originCountryIso2: 'LT', categorySlug: 'chocolates', brandSlug: 'ruta', description: 'Šiauliai\u2019s 1913 chocolatier.' },

  // =========================================================================
  // SWEDEN
  // =========================================================================
  { slug: 'surstroemming', name: 'Surströmming', originCountryIso2: 'SE', categorySlug: 'fish-seafood', description: 'Fermented Baltic herring in a swelling tin. Open outdoors.' },
  { slug: 'kalles-kaviar', name: 'Kalles Kaviar', originCountryIso2: 'SE', categorySlug: 'sauces-spices', description: 'Smoked-cod-roe spread in the iconic blue tube.' },
  { slug: 'knaeckebrod', name: 'Knäckebröd', originCountryIso2: 'SE', categorySlug: 'baked', description: 'Crisp rye flatbread — Wasa, Leksands, hand-baked rounds.' },
  { slug: 'lingonsylt', name: 'Lingonsylt', originCountryIso2: 'SE', categorySlug: 'pickles-preserves', description: 'Lingonberry jam — for meatballs and pancakes.' },
  { slug: 'marabou-mjölk', name: 'Marabou Mjölkchoklad', originCountryIso2: 'SE', categorySlug: 'chocolates', brandSlug: 'marabou', description: 'The Swedish milk-chocolate bar.' },
  { slug: 'daim', name: 'Daim', originCountryIso2: 'SE', categorySlug: 'chocolates', brandSlug: 'marabou', description: 'Hard almond-caramel core in milk chocolate.' },
  { slug: 'plopp', name: 'Plopp', originCountryIso2: 'SE', categorySlug: 'chocolates', brandSlug: 'marabou', description: 'Soft caramel in milk chocolate, log-shape.' },
  { slug: 'ahlgrens-bilar', name: 'Ahlgrens Bilar', originCountryIso2: 'SE', categorySlug: 'candies', description: 'Foam-car candies — Sweden\u2019s best-selling sweet.' },
  { slug: 'kex', name: 'Cloetta Kex', originCountryIso2: 'SE', categorySlug: 'chocolates', description: 'Wafer chocolate bar.' },
  { slug: 'pepparkakor', name: 'Pepparkakor', originCountryIso2: 'SE', categorySlug: 'biscuits', description: 'Thin spiced ginger biscuits — Christmas.' },
  { slug: 'falukorv', name: 'Falukorv', originCountryIso2: 'SE', categorySlug: 'cured-meats', description: 'Mild ring-sausage — pan-fry slices for everyman dinner.' },
  { slug: 'gravlax', name: 'Gravlax', originCountryIso2: 'SE', categorySlug: 'fish-seafood', description: 'Sugar-salt-dill cured salmon, sliced thin.' },
  { slug: 'salmiak', name: 'Salty licorice (Salmiak)', originCountryIso2: 'SE', categorySlug: 'candies', description: 'Ammonium-chloride licorice — a Nordic identity test.' },
  { slug: 'punsch-rulle', name: 'Punsch-rulle (Dammsugare)', originCountryIso2: 'SE', categorySlug: 'baked', description: 'Marzipan-wrapped cake-and-cocoa log.' },

  // =========================================================================
  // DENMARK
  // =========================================================================
  { slug: 'rugbrod', name: 'Rugbrød', originCountryIso2: 'DK', categorySlug: 'baked', description: 'Dense Danish rye bread — base of every smørrebrød.' },
  { slug: 'leverpostej', name: 'Leverpostej', originCountryIso2: 'DK', categorySlug: 'pate-aspic', description: 'Pork-liver paté — slather on rugbrød with pickled beets.' },
  { slug: 'anthon-berg-marzipan', name: 'Anthon Berg marzipan bars', originCountryIso2: 'DK', categorySlug: 'chocolates', brandSlug: 'anthon-berg', description: 'Marzipan in dark chocolate — the gold-foil bar.' },
  { slug: 'toms-skildpadde', name: 'Toms Skildpadde', originCountryIso2: 'DK', categorySlug: 'chocolates', brandSlug: 'toms', description: 'Caramel-and-nougat \u201cturtle\u201d in milk chocolate.' },
  { slug: 'aquavit', name: 'Aquavit (Akvavit)', originCountryIso2: 'DK', categorySlug: 'spirits-wine-beer', description: 'Caraway-and-dill spirit, often drunk ice-cold.' },
  { slug: 'spegepoelse', name: 'Spegepølse', originCountryIso2: 'DK', categorySlug: 'cured-meats', description: 'Air-cured Danish salami, often with cardamom or pepper.' },
  { slug: 'aebleskiver', name: 'Æbleskiver (frozen)', originCountryIso2: 'DK', categorySlug: 'frozen', description: 'Spherical pancake puffs — dust with sugar, dip in jam.' },
  { slug: 'ymer', name: 'Ymer', originCountryIso2: 'DK', categorySlug: 'cheese-dairy', description: 'Tangy Danish cultured-milk product — like thin yogurt.' },

  // =========================================================================
  // NORWAY (EEA)
  // =========================================================================
  { slug: 'brunost', name: 'Brunost (Gudbrandsdalsost)', originCountryIso2: 'NO', categorySlug: 'cheese-dairy', description: 'Caramelised whey \u201cbrown cheese\u201d — slice with a wire ostehøvel.' },
  { slug: 'geitost', name: 'Geitost', originCountryIso2: 'NO', categorySlug: 'cheese-dairy', description: 'Goat-milk version of brunost.' },
  { slug: 'lutefisk', name: 'Lutefisk', originCountryIso2: 'NO', categorySlug: 'fish-seafood', description: 'Lye-cured cod, jellied — a Christmas commitment.' },
  { slug: 'akvavit-no', name: 'Akvavit (Norwegian)', originCountryIso2: 'NO', categorySlug: 'spirits-wine-beer', description: 'Linje akvavit — sea-aged barrels add depth.' },
  { slug: 'freia-melkesjokolade', name: 'Freia Melkesjokolade', originCountryIso2: 'NO', categorySlug: 'chocolates', brandSlug: 'freia', description: 'The Norwegian milk-chocolate bar.' },
  { slug: 'smash', name: 'Smash!', originCountryIso2: 'NO', categorySlug: 'chocolates', brandSlug: 'freia', description: 'Salted-corn cones in milk chocolate.' },
  { slug: 'kvikk-lunsj', name: 'Kvikk Lunsj', originCountryIso2: 'NO', categorySlug: 'chocolates', brandSlug: 'freia', description: '\u201cQuick lunch\u201d wafer bar — the hytte hike companion.' },
  { slug: 'salt-licorice-no', name: 'Lakris (Norwegian salt licorice)', originCountryIso2: 'NO', categorySlug: 'candies', description: 'Black salty bites — the Nordic favourite.' },

  // =========================================================================
  // FINLAND
  // =========================================================================
  { slug: 'salmiakki', name: 'Salmiakki', originCountryIso2: 'FI', categorySlug: 'candies', description: 'Hard, ammoniated salt licorice — Finnish national flavour.' },
  { slug: 'fazer-blue', name: 'Karl Fazer Mjölkchoklad', originCountryIso2: 'FI', categorySlug: 'chocolates', brandSlug: 'fazer', description: 'The blue-wrapped milk-chocolate bar — Finland\u2019s pride.' },
  { slug: 'geisha', name: 'Geisha', originCountryIso2: 'FI', categorySlug: 'chocolates', brandSlug: 'fazer', description: 'Hazelnut nougat in milk chocolate.' },
  { slug: 'tutti-frutti', name: 'Tutti Frutti', originCountryIso2: 'FI', categorySlug: 'candies', brandSlug: 'fazer', description: 'Chewy fruit candies in waxy paper.' },
  { slug: 'mammi', name: 'Mämmi', originCountryIso2: 'FI', categorySlug: 'baked', description: 'Easter rye-malt pudding — eaten cold with cream and sugar.' },
  { slug: 'karjalanpiirakka', name: 'Karjalanpiirakka', originCountryIso2: 'FI', categorySlug: 'baked', description: 'Karelian rye-crust pies with rice porridge.' },
  { slug: 'leipajuusto', name: 'Leipäjuusto', originCountryIso2: 'FI', categorySlug: 'cheese-dairy', description: 'Squeaky bread cheese — warm with cloudberry jam.' },
  { slug: 'mustikkasoppa', name: 'Mustikkasoppa', originCountryIso2: 'FI', categorySlug: 'ready-meals', description: 'Sweet blueberry soup.' },
  { slug: 'ruisleipa', name: 'Ruisleipä', originCountryIso2: 'FI', categorySlug: 'baked', description: 'Sour Finnish rye bread — flat round loaves.' },
  { slug: 'lakka', name: 'Lakka liqueur', originCountryIso2: 'FI', categorySlug: 'spirits-wine-beer', description: 'Cloudberry liqueur — Lapland in a glass.' },
  { slug: 'pulla', name: 'Pulla', originCountryIso2: 'FI', categorySlug: 'baked', description: 'Cardamom-scented sweet bread.' },
  { slug: 'puolukkahillo', name: 'Puolukkahillo', originCountryIso2: 'FI', categorySlug: 'pickles-preserves', description: 'Finnish lingonberry jam.' },

  // =========================================================================
  // IRELAND
  // =========================================================================
  { slug: 'tayto-cheese-onion', name: 'Tayto Cheese & Onion', originCountryIso2: 'IE', categorySlug: 'biscuits', brandSlug: 'tayto', description: 'The Irish crisp — accept no substitute.' },
  { slug: 'cadbury-ie-dairy-milk', name: 'Cadbury Dairy Milk (Irish recipe)', originCountryIso2: 'IE', categorySlug: 'chocolates', brandSlug: 'cadbury-ie', description: 'Made at Coolock — Irish abroad swear it tastes different to British.' },
  { slug: 'barrys-tea', name: 'Barry\u2019s Tea Gold', originCountryIso2: 'IE', categorySlug: 'tea-coffee', brandSlug: 'barrys-tea', description: 'Cork-blended black tea — a strong cup of Cork.' },
  { slug: 'lyons-tea', name: 'Lyons Tea', originCountryIso2: 'IE', categorySlug: 'tea-coffee', description: 'The other side of the Irish tea-tribe debate.' },
  { slug: 'kerrygold-butter', name: 'Kerrygold butter', originCountryIso2: 'IE', categorySlug: 'cheese-dairy', brandSlug: 'kerrygold', description: 'Pasture-fed Irish butter — gold foil.' },
  { slug: 'clonakilty-black-pudding', name: 'Clonakilty Black Pudding', originCountryIso2: 'IE', categorySlug: 'cured-meats', description: 'West Cork blood pudding — Sunday-fry essential.' },
  { slug: 'clonakilty-white-pudding', name: 'Clonakilty White Pudding', originCountryIso2: 'IE', categorySlug: 'cured-meats', description: 'White (no blood) pudding — barley-and-pork.' },
  { slug: 'soda-bread-mix', name: 'Soda bread mix', originCountryIso2: 'IE', categorySlug: 'baked', description: 'Buttermilk-and-bicarb bread that needs no yeast.' },
  { slug: 'jameson', name: 'Jameson Irish Whiskey', originCountryIso2: 'IE', categorySlug: 'spirits-wine-beer', description: 'Triple-distilled Irish whiskey — Midleton.' },
  { slug: 'baileys', name: 'Baileys Irish Cream', originCountryIso2: 'IE', categorySlug: 'spirits-wine-beer', description: 'Whiskey, cream, cocoa.' },

  // =========================================================================
  // LUXEMBOURG
  // =========================================================================
  { slug: 'quetschentaart', name: 'Quetschentaart', originCountryIso2: 'LU', categorySlug: 'baked', description: 'Damson-plum tart — late-summer Luxembourg.' },
  { slug: 'kachkeis', name: 'Kachkéis', originCountryIso2: 'LU', categorySlug: 'cheese-dairy', description: 'Cooked cheese spread, often with caraway.' },
  { slug: 'bouneschlupp', name: 'Bouneschlupp mix', originCountryIso2: 'LU', categorySlug: 'ready-meals', description: 'Green-bean soup with potatoes and bacon.' },
  { slug: 'riesling-pate', name: 'Riesling pâté', originCountryIso2: 'LU', categorySlug: 'pate-aspic', description: 'Pork pâté with Mosel Riesling jelly on top.' },

  // =========================================================================
  // ICELAND
  // =========================================================================
  { slug: 'skyr', name: 'Skyr', originCountryIso2: 'IS', categorySlug: 'cheese-dairy', description: 'High-protein Icelandic cultured milk — between yoghurt and curd.' },
  { slug: 'hakarl', name: 'Hákarl', originCountryIso2: 'IS', categorySlug: 'fish-seafood', description: 'Fermented Greenland-shark cubes. A rite of passage.' },
  { slug: 'lakkris', name: 'Icelandic Lakkrís', originCountryIso2: 'IS', categorySlug: 'candies', brandSlug: 'noi-sirius', description: 'Salty licorice often filled or coated in chocolate.' },
  { slug: 'brennivin', name: 'Brennivín', originCountryIso2: 'IS', categorySlug: 'spirits-wine-beer', description: 'Caraway aquavit — \u201cBlack Death\u201d.' },
  { slug: 'hardfiskur', name: 'Harðfiskur', originCountryIso2: 'IS', categorySlug: 'fish-seafood', description: 'Wind-dried haddock — eat with butter.' },

  // =========================================================================
  // SWITZERLAND
  // =========================================================================
  { slug: 'lindt-excellence', name: 'Lindt Excellence', originCountryIso2: 'CH', categorySlug: 'chocolates', description: 'The dark-chocolate tablet range.' },
  { slug: 'toblerone', name: 'Toblerone', originCountryIso2: 'CH', categorySlug: 'chocolates', description: 'The triangular honey-nougat-and-chocolate bar.' },
  { slug: 'ovomaltine', name: 'Ovomaltine', originCountryIso2: 'CH', categorySlug: 'soft-drinks', description: 'Malt-extract chocolate drink — and the crunchy spread.' },
  { slug: 'aromat', name: 'Aromat', originCountryIso2: 'CH', categorySlug: 'sauces-spices', description: 'Yellow-tin all-purpose seasoning that ends up on everything.' },
  { slug: 'raclette', name: 'Raclette du Valais AOP', originCountryIso2: 'CH', categorySlug: 'cheese-dairy', description: 'Wheel cheese for melting — the original raclette.' },
  { slug: 'gruyere', name: 'Le Gruyère AOP', originCountryIso2: 'CH', categorySlug: 'cheese-dairy', description: 'Cave-aged Swiss cheese — fondue base.' },
  { slug: 'cenovis', name: 'Cenovis', originCountryIso2: 'CH', categorySlug: 'sauces-spices', description: 'Yeasty Swiss cousin of Marmite.' },
];
