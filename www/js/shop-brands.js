/* ميزان — منتجات بالماركات المشهورة في السعودية ومصر. السطر: بلد|قسم.فرعي|الماركة عربي~إنجليزي|منتج~Product;منتج~Product
   البلد: sa سعودية، eg مصر، b الاتنين. الأسماء أنواع منتجات عامة معروفة للماركة، مش أكواد أو أحجام محددة. */
'use strict';
const BRAND_DATA = `
sa|food.dairy|المراعي~Almarai|حليب طازج كامل الدسم~Fresh full-fat milk;حليب طازج قليل الدسم~Fresh low-fat milk;حليب خالي الدسم~Skimmed milk;حليب طويل الأجل~Long-life milk;لبن~Laban;لبن قليل الدسم~Low-fat laban;زبادي~Yoghurt;زبادي يوناني~Greek yoghurt;لبنة~Labneh;لبنة قليلة الدسم~Low-fat labneh;جبنة شيدر~Cheddar cheese;جبنة شرائح~Cheese slices;جبنة مثلثات~Cheese triangles;جبنة كريمي~Cream cheese spread;جبنة فيتا~Feta cheese;جبنة حلوم~Halloumi;جبنة موزاريلا~Mozzarella;زبدة~Butter;قشطة~Cream;كريمة طبخ~Cooking cream;كريمة خفق~Whipping cream;حليب بالشوكولاتة~Chocolate milk;حليب بالفراولة~Strawberry milk;حليب بالموز~Banana milk;حليب بالتمر~Date milk;حليب خالي اللاكتوز~Lactose-free milk;حليب عالي البروتين~High-protein milk;زبادي بالفواكه~Fruit yoghurt;روب~Rayeb;كاسترد~Custard
sa|drinks.juice|المراعي~Almarai|عصير برتقال~Orange juice;عصير برتقال وجزر~Orange & carrot juice;عصير مانجو~Mango juice;عصير تفاح~Apple juice;عصير مشكل~Mixed fruit juice;عصير جوافة~Guava juice;عصير عنب~Grape juice;عصير أناناس~Pineapple juice;عصير ليمون بالنعناع~Lemon mint juice
sa|food.bakery|لوزين~L'usine|خبز توست أبيض~White toast bread;خبز توست بر~Brown toast bread;خبز توست حبوب~Multigrain toast;خبز برجر~Burger buns;خبز هوت دوغ~Hot dog buns;كرواسون~Croissants;كيك~Cake;مافن~Muffins;بقصم~Rusks;خبز صامولي~Samoli bread
sa|food.bakery|سفن دايز~7DAYS|كرواسون بالشوكولاتة~Chocolate croissant;كرواسون بالفانيليا~Vanilla croissant;كرواسون بالجبن~Cheese croissant;سويس رول~Swiss roll;كيك بار~Cake bar
sa|food.dairy|نادك~Nadec|حليب طازج كامل الدسم~Fresh full-fat milk;حليب طازج قليل الدسم~Fresh low-fat milk;حليب طويل الأجل~Long-life milk;لبن~Laban;زبادي~Yoghurt;لبنة~Labneh;جبنة شرائح~Cheese slices;جبنة كريمي~Cream cheese;جبنة فيتا~Feta;زبدة~Butter;قشطة~Cream;حليب بالشوكولاتة~Chocolate milk;حليب بالفراولة~Strawberry milk;عصير برتقال~Orange juice;عصير مانجو~Mango juice
sa|food.dairy|الصافي دانون~Al Safi Danone|حليب طازج~Fresh milk;حليب قليل الدسم~Low-fat milk;لبن~Laban;زبادي~Yoghurt;زبادي أكتيفيا~Activia yoghurt;لبنة~Labneh;حليب بالشوكولاتة~Chocolate milk;زبادي يوناني~Greek yoghurt;زبادي بالفواكه~Fruit yoghurt
sa|food.dairy|سدافكو السعودية~SADAFCO Saudia|حليب طويل الأجل~UHT milk;حليب بالشوكولاتة~Chocolate milk;حليب بالفراولة~Strawberry milk;كريمة طبخ~Cooking cream;حليب مبخر~Evaporated milk;معجون طماطم~Tomato paste;آيس كريم~Ice cream;جبنة مثلثات~Cheese triangles;حليب بودرة~Milk powder;زبدة~Butter
b|food.dairy|بوك~Puck|جبنة كريمي برطمان~Cream cheese jar;جبنة شرائح~Cheese slices;جبنة مثلثات~Cheese triangles;قشطة~Cream;جبنة شيدر مبشورة~Grated cheddar
b|food.dairy|كيري~Kiri|جبنة مربعات~Cheese squares;جبنة كريمي برطمان~Cream cheese jar;جبنة سبريد~Cheese spread
b|food.dairy|البقرة الضاحكة~La Vache qui rit|جبنة مثلثات~Cheese triangles;جبنة مثلثات لايت~Light cheese triangles;جبنة شرائح~Cheese slices;جبنة سبريد برطمان~Cheese spread jar
b|food.dairy|كرافت~Kraft|جبنة شيدر علبة~Cheddar cheese tin;جبنة شرائح~Cheese slices;جبنة كريمي~Cream cheese;مايونيز~Mayonnaise
b|food.dairy|بريزيدون~Président|جبنة كريمي~Cream cheese;جبنة شرائح~Cheese slices;زبدة~Butter;جبنة موزاريلا~Mozzarella;جبنة إيمنتال~Emmental;جبنة بري~Brie;جبنة مثلثات~Cheese triangles;كريمة طبخ~Cooking cream
b|food.dairy|لورباك~Lurpak|زبدة غير مملحة~Unsalted butter;زبدة مملحة~Salted butter;زبدة قابلة للدهن~Spreadable butter
b|food.dairy|فيلادلفيا~Philadelphia|جبنة كريمي أصلي~Original cream cheese;جبنة كريمي لايت~Light cream cheese
b|food.dairy|نستله~Nestlé|حليب مبخر~Evaporated milk;حليب مكثف محلى~Sweetened condensed milk;قشطة~Cream;حليب نيدو بودرة~Nido milk powder;حليب كوفي ميت~Coffee-mate creamer
b|food.dairy|رينبو~Rainbow|حليب مبخر~Evaporated milk;حليب مبخر قليل الدسم~Low-fat evaporated milk
b|food.dairy|أبو قوس~Abu Qaws|حليب مبخر~Evaporated milk
eg|food.dairy|جهينة~Juhayna|لبن كامل الدسم~Full-cream milk;لبن نص دسم~Half-cream milk;لبن خالي الدسم~Skimmed milk;لبن خالي اللاكتوز~Lactose-free milk;زبادي~Yoghurt;زبادي يوناني~Greek yoghurt;رايب~Rayeb;لبن بالشوكولاتة~Chocolate milk;لبن بالفراولة~Strawberry milk;جبنة بيضا~White cheese;جبنة فيتا~Feta;جبنة إسطنبولي~Istanbuli cheese;زبادي بالفواكه~Fruit yoghurt;لبن رايب لايت~Light rayeb
eg|drinks.juice|جهينة~Juhayna|عصير بيور برتقال~Pure orange juice;عصير بيور مانجو~Pure mango juice;عصير بيور تفاح~Pure apple juice;عصير بيور جوافة~Pure guava juice;عصير بيور مشكل~Pure mixed juice;عصير بيور أناناس~Pure pineapple juice;عصير بيور عنب~Pure grape juice;عصير بيور كوكتيل~Pure cocktail juice
eg|food.dairy|دومتي~Domty|جبنة بيضا فيتا~White feta cheese;جبنة إسطنبولي~Istanbuli cheese;جبنة رومي~Roumy cheese;جبنة شيدر~Cheddar;جبنة مثلثات~Cheese triangles;جبنة كريمي~Cream cheese;جبنة قريش~Areesh cheese;جبنة موزاريلا~Mozzarella;جبنة تركي~Turkish cheese;زبادي~Yoghurt;لبن~Milk;عصير مانجو~Mango juice;عصير جوافة~Guava juice;عصير برتقال~Orange juice
eg|food.dairy|لمار~Lamar|لبن كامل الدسم~Full-cream milk;لبن خالي الدسم~Skimmed milk;لبن بالشوكولاتة~Chocolate milk;زبادي~Yoghurt;عصير برتقال~Orange juice;عصير مانجو~Mango juice;عصير جوافة~Guava juice
eg|food.dairy|بيتي~Beyti|لبن كامل الدسم~Full-cream milk;لبن نص دسم~Half-cream milk;لبن بالشوكولاتة~Chocolate milk;زبادي~Yoghurt;زبادي أكتيفيا~Activia yoghurt;رايب~Rayeb;عصير برتقال~Orange juice;عصير مانجو~Mango juice;عصير جوافة~Guava juice
eg|food.dairy|العبور لاند~Obour Land|جبنة بيضا~White cheese;جبنة فيتا~Feta cheese;جبنة إسطنبولي~Istanbuli cheese;جبنة رومي~Roumy cheese;جبنة قريش~Areesh cheese;زبادي~Yoghurt;لبن~Milk;زبدة~Butter
eg|food.dairy|باندا~Panda|جبنة شرائح~Cheese slices;جبنة مثلثات~Cheese triangles;جبنة شيدر~Cheddar;جبنة كريمي~Cream cheese
eg|food.dairy|إيسيس~ISIS|لبن عضوي~Organic milk;زبادي عضوي~Organic yoghurt;عسل نحل~Honey;شوفان~Oats;مربى~Jam;طحينة~Tahini
eg|food.dairy|المراعي مصر~Almarai Egypt|لبن~Milk;زبادي~Yoghurt;جبنة مثلثات~Cheese triangles;جبنة شيدر~Cheddar
eg|food.dairy|فرج الله~Farag Allah|جبنة رومي~Roumy cheese;جبنة إسطنبولي~Istanbuli cheese;جبنة شيدر~Cheddar;جبنة بيضا~White cheese
sa|food.poultry|الوطنية~Al-Watania|دجاج كامل طازج~Fresh whole chicken;صدور دجاج~Chicken breasts;أفخاذ دجاج~Chicken thighs;أجنحة دجاج~Chicken wings;دبابيس دجاج~Drumsticks;دجاج مقطع~Chicken pieces;فيليه دجاج~Chicken fillet;دجاج مجمد~Frozen chicken;كبدة دجاج~Chicken liver;قوانص~Gizzards;بيض~Eggs
sa|food.poultry|فقيه~Fakieh|دجاج كامل طازج~Fresh whole chicken;صدور دجاج~Chicken breasts;أفخاذ دجاج~Chicken thighs;أجنحة دجاج~Chicken wings;دجاج مقطع~Chicken pieces;فيليه دجاج متبل~Marinated chicken fillet;برجر دجاج~Chicken burger;ناجتس~Nuggets
sa|food.poultry|تنمية~Tanmiah|دجاج كامل طازج~Fresh whole chicken;صدور دجاج~Chicken breasts;دجاج مقطع~Chicken pieces;أجنحة دجاج~Chicken wings
sa|food.poultry|اليوم~Alyoum|دجاج كامل طازج~Fresh whole chicken;صدور دجاج~Chicken breasts;أفخاذ دجاج~Chicken thighs;دجاج مقطع~Chicken pieces
sa|food.poultry|ساديا~Sadia|دجاج كامل مجمد~Frozen whole chicken;صدور دجاج مجمدة~Frozen chicken breasts;برجر دجاج~Chicken burger;ناجتس~Nuggets;شاورما دجاج~Chicken shawarma;زنجر~Zinger strips;نقانق دجاج~Chicken franks
sa|food.poultry|دوجا~Doux|دجاج كامل مجمد~Frozen whole chicken
b|food.poultry|سيارا~Seara|دجاج كامل مجمد~Frozen whole chicken;صدور دجاج مجمدة~Frozen breasts;ناجتس~Nuggets;برجر~Burger
eg|food.poultry|كوكي~Koki|فراخ كاملة مجمدة~Frozen whole chicken;صدور فراخ~Chicken breasts;أوراك فراخ~Chicken legs;أجنحة فراخ~Chicken wings;بانيه~Pané fillet;ناجتس~Nuggets;برجر فراخ~Chicken burger;شيش طاووق~Shish tawook;استربس~Strips
eg|food.poultry|الوطنية مصر~El Wataneya|فراخ كاملة مجمدة~Frozen whole chicken;صدور فراخ~Chicken breasts;بانيه~Pané;ناجتس~Nuggets;كبدة فراخ~Chicken liver
eg|food.poultry|القاهرة للدواجن أطياب~Atyab|فراخ كاملة~Whole chicken;صدور فراخ~Chicken breasts;بانيه~Pané;برجر فراخ~Chicken burger;سجق فراخ~Chicken sausage;ناجتس~Nuggets;كفتة فراخ~Chicken kofta
b|food.poultry|حلواني إخوان~Halwani Bros|لانشون فراخ~Chicken luncheon;لانشون بقري~Beef luncheon;بسطرمة~Pastrami;سجق~Sausage;برجر بقري~Beef burger;كفتة~Kofta;هوت دوج~Hot dog
b|food.meat|أمريكانا~Americana|برجر لحم~Beef burger;برجر دجاج~Chicken burger;كفتة~Kofta;سجق~Sausage;ناجتس~Nuggets;كبة~Kibbeh;سمبوسة~Samosa;بطاطس مقلية مجمدة~Frozen fries;خضار مشكل مجمد~Frozen mixed vegetables;بسلة مجمدة~Frozen peas;ملوخية مجمدة~Frozen molokhia;بامية مجمدة~Frozen okra;لانشون~Luncheon meat;مارتديلا~Mortadella
sa|food.meat|الهلال~Al Hilal|لحم غنم طازج~Fresh lamb;لحم بقري~Beef;مفروم بقري~Minced beef;كبدة غنم~Lamb liver
sa|food.meat|ساديا لحوم~Sadia Meats|برجر لحم~Beef burger;نقانق بقري~Beef franks;مرتديلا~Mortadella
b|food.fish|-~-|فيليه بلطي مجمد~Frozen tilapia fillet;فيليه بوري~Mullet fillet;جمبري مجمد~Frozen shrimp;كاليماري~Calamari;أصابع سمك~Fish fingers;سلمون فيليه~Salmon fillet
eg|food.fish|السمك المصري~Egyptian fish|بلطي~Tilapia;بوري~Mullet;مكرونة سمك~Fish fillet;سردين~Sardines;جمبري~Shrimp;كابوريا~Crab;سبيط~Squid;وقار~Grouper;مرجان~Sea bream;قاروص~Sea bass;موسى~Sole;رنجة~Smoked herring;فسيخ~Feseekh
b|food.canned|قودي~Goody|تونة بالزيت~Tuna in oil;تونة بالماء~Tuna in water;تونة قطع لايت~Light tuna chunks;ذرة حلوة~Sweet corn;فول مدمس~Foul medames;حمص مسلوق~Boiled chickpeas;فطر شرائح~Sliced mushrooms;زيتون أخضر~Green olives;زيتون أسود~Black olives;معجون طماطم~Tomato paste;مايونيز~Mayonnaise;كاتشب~Ketchup;خردل~Mustard;زبدة فول سوداني~Peanut butter;مربى فراولة~Strawberry jam;مربى مشمش~Apricot jam;عسل~Honey;حليب مكثف~Condensed milk;أناناس معلب~Canned pineapple;خوخ معلب~Canned peaches;كوكتيل فواكه~Fruit cocktail;صلصة بيتزا~Pizza sauce
b|food.canned|كاليفورنيا جاردن~California Garden|فول مدمس~Foul medames;فول بالطحينة~Foul with tahini;فول حار~Spicy foul;حمص بالطحينة~Hummus tahini;حمص حب~Chickpeas;فاصوليا بيضا~White beans;فاصوليا حمراء~Red kidney beans;ذرة~Sweet corn;تونة~Tuna;بازلاء~Peas;مشروم~Mushrooms;بامية~Okra;ملوخية~Molokhia
b|food.canned|أمريكانا معلبات~Americana Canned|فول مدمس~Foul medames;تونة~Tuna;معجون طماطم~Tomato paste;مربى~Jam
b|food.canned|هاينز~Heinz|كاتشب~Ketchup;مايونيز~Mayonnaise;فاصوليا بالصلصة~Baked beans;خل~Vinegar;خردل~Mustard;صلصة باربكيو~BBQ sauce;معجون طماطم~Tomato paste
b|food.canned|فريشلي~Freshly|تونة بالزيت~Tuna in oil;تونة بالماء~Tuna in water;ذرة~Sweet corn;فول~Foul;زيتون~Olives;مربى~Jam;عسل~Honey
b|food.canned|دولفين~Dolphin|تونة بالزيت~Tuna in oil;تونة بالماء~Tuna in water;سردين~Sardines
b|food.canned|ريو مارى~Rio Mare|تونة بزيت الزيتون~Tuna in olive oil;تونة بالماء~Tuna in water
eg|food.canned|صن شاين~Sunshine|تونة قطع~Tuna chunks;تونة مفتتة~Flaked tuna;سردين~Sardines
eg|food.canned|هارفست~Harvest Foods|فول مدمس~Foul;صلصة طماطم~Tomato sauce;صلصة~Tomato paste;بسلة~Peas;مربى~Jam;ملوخية~Molokhia;خضار مشكل~Mixed vegetables
eg|food.canned|فيتراك~Vitrac|مربى فراولة~Strawberry jam;مربى مشمش~Apricot jam;مربى تين~Fig jam;مربى برتقال~Orange marmalade;عسل~Honey
eg|food.canned|إيدفينا~Edfina|فول مدمس~Foul;بسلة~Peas;مربى~Jam;صلصة~Tomato paste;خضار مجمد~Frozen vegetables
eg|food.canned|هاينز مصر~Heinz Egypt|كاتشب~Ketchup;صلصة طماطم~Tomato sauce;مايونيز~Mayonnaise
sa|food.grains|أبو كاس~Abu Kass|أرز بسمتي~Basmati rice;أرز بسمتي سيلا~Sella basmati rice;أرز مزة~Mazza rice
sa|food.grains|الوليمة~Al Walimah|أرز بسمتي~Basmati rice;أرز سيلا~Sella rice
sa|food.grains|محمود~Mahmood|أرز بسمتي~Basmati rice;أرز سيلا~Sella rice;شاي~Tea
sa|food.grains|الشعلان~Al Shalan|أرز بسمتي~Basmati rice
b|food.grains|تيلدا~Tilda|أرز بسمتي~Basmati rice;أرز بسمتي بني~Brown basmati;أرز جاهز ميكروويف~Microwave rice
b|food.grains|أبو بنت~Abu Bint|أرز مصري~Egyptian rice;أرز كاليفورني~Calrose rice
b|food.grains|السنبلة~Sunbulah|دقيق أبيض~White flour;دقيق بر~Wholewheat flour;أرز~Rice;شعيرية~Vermicelli;عجينة سمبوسة~Samosa sheets;عجينة فيلو~Filo pastry;عجينة بف~Puff pastry;خضار مجمد~Frozen vegetables;توت مجمد~Frozen berries
sa|food.grains|فوم~Foom|دقيق أبيض~White flour;دقيق بر~Wholewheat flour;دقيق متعدد الاستخدامات~All-purpose flour
b|food.grains|الطاحونة الأولى~First Mills|دقيق فاخر~Fancy flour;دقيق بر~Brown flour
b|food.grains|بانزاني~Panzani|مكرونة سباجيتي~Spaghetti;مكرونة بيني~Penne;مكرونة فوسيلي~Fusilli;مكرونة لازانيا~Lasagne sheets;صلصة طماطم للمكرونة~Pasta sauce
b|food.grains|باريلا~Barilla|سباجيتي~Spaghetti;بيني~Penne;فوسيلي~Fusilli;لازانيا~Lasagne;مكرونة قمح كامل~Wholewheat pasta;مكرونة بدون جلوتين~Gluten-free pasta
b|food.grains|ريجينا~Regina|مكرونة قلم~Penne;مكرونة سباجيتي~Spaghetti;مكرونة لسان عصفور~Orzo;شعرية~Vermicelli;مكرونة إسباجيتي رفيعة~Thin spaghetti
b|food.grains|الملكة~El Malika|مكرونة قلم~Penne;مكرونة سباجيتي~Spaghetti;مكرونة مرمرية~Lissan asfour;شعرية~Vermicelli;مكرونة خواتم~Ring pasta;مكرونة صدف~Shells
b|food.grains|كويكر~Quaker|شوفان~Oats;شوفان سريع التحضير~Quick oats;شوفان كامل~Whole oats;شوفان بالفواكه~Fruit oats
b|food.grains|إندومي~Indomie|نودلز بالدجاج~Chicken noodles;نودلز بالخضار~Vegetable noodles;نودلز حار~Spicy noodles;نودلز كاري~Curry noodles;نودلز بالجمبري~Shrimp noodles
b|food.grains|ماجي~Maggi|نودلز دجاج~Chicken noodles;مكعبات مرق دجاج~Chicken stock cubes;مكعبات مرق لحم~Beef stock cubes;شوربة كريمة الفطر~Mushroom soup;شوربة عدس~Lentil soup;بهارات~Seasoning
b|food.grains|كنور~Knorr|مكعبات مرق دجاج~Chicken stock cubes;مكعبات مرق لحم~Beef stock cubes;مكعبات مرق خضار~Vegetable stock cubes;شوربة كريمة الدجاج~Cream of chicken soup;شوربة فطر~Mushroom soup;شوربة عدس~Lentil soup;شوربة خضار~Vegetable soup
eg|food.grains|الضحى~El Doha|أرز مصري~Egyptian rice;أرز بسمتي~Basmati rice;مكرونة~Pasta;عدس~Lentils;فول~Fava beans;سكر~Sugar
eg|food.grains|الساعة~El Saa'a|أرز مصري~Egyptian rice
eg|food.grains|الدقيق الفاخر الشمس~Shams flour|دقيق فاخر~Fine flour;دقيق متعدد الاستخدامات~All-purpose flour
eg|food.grains|كوين~Queen|مكرونة قلم~Penne;مكرونة سباجيتي~Spaghetti;شعرية~Vermicelli;دقيق~Flour;مكرونة لسان عصفور~Orzo
eg|food.grains|الحرمين~El Haramein|أرز مصري~Egyptian rice;سكر~Sugar
b|food.oils|عافية~Afia|زيت دوار الشمس~Sunflower oil;زيت ذرة~Corn oil;زيت كانولا~Canola oil;زيت زيتون~Olive oil;زيت نباتي~Vegetable oil
b|food.oils|العربي~Al Arabi|زيت دوار الشمس~Sunflower oil;زيت ذرة~Corn oil;زيت نباتي~Vegetable oil
b|food.oils|نور~Noor|زيت دوار الشمس~Sunflower oil;زيت ذرة~Corn oil
b|food.oils|بورجيس~Borges|زيت زيتون بكر~Extra virgin olive oil;زيت زيتون خفيف~Light olive oil
b|food.oils|أصيل~Aseel|سمن حيواني~Butter ghee;سمن نباتي~Vegetable ghee
b|food.oils|كريستال~Crystal|زيت عباد الشمس~Sunflower oil;زيت ذرة~Corn oil;زيت خليط~Blended oil;سمن نباتي~Vegetable ghee
eg|food.oils|عافية مصر~Afia Egypt|زيت عباد الشمس~Sunflower oil;زيت ذرة~Corn oil
eg|food.oils|هلا~Hala|زيت عباد الشمس~Sunflower oil;زيت خليط~Blended oil
eg|food.oils|أرما~Arma|زيت عباد الشمس~Sunflower oil;زيت ذرة~Corn oil;سمن نباتي~Vegetable ghee;زبدة صناعي~Margarine
b|food.spices|ماكورميك~McCormick|فلفل أسود~Black pepper;بابريكا~Paprika;كركم~Turmeric;كمون~Cumin;قرفة~Cinnamon;بهارات مشكلة~Mixed spice;أوريجانو~Oregano;ثوم بودرة~Garlic powder;بصل بودرة~Onion powder;زنجبيل بودرة~Ground ginger;هيل~Cardamom;قرنفل~Cloves
sa|food.spices|بهارات الأحمد~Al Ahmad|بهارات كبسة~Kabsa spice;بهارات مندي~Mandi spice;بهارات دجاج~Chicken spice;بهارات لحم~Meat spice
sa|food.spices|أبو العز~Abu Al Ezz|بهارات كبسة~Kabsa spice;هيل~Cardamom;زعفران~Saffron
eg|food.spices|الشيف~El Chef|بهارات مشكلة~Mixed spices;كمون~Cumin;شطة~Chili powder;فلفل أسود~Black pepper
eg|food.spices|بهارات القاضي~El Kady|كمون~Cumin;كزبرة ناشفة~Dried coriander;فلفل أسود~Black pepper;بهارات كفتة~Kofta spice;بهارات فراخ~Chicken spice
b|food.spices|-~-|ملح طعام~Table salt;ملح بحري~Sea salt;ملح هيمالايا~Himalayan salt;ملح قليل الصوديوم~Low-sodium salt
b|food.spices|الأسرة سكر~Al Osra|سكر~Sugar
sa|food.spices|سكر الخليج~Al Khaleej Sugar|سكر أبيض~White sugar;سكر مكعبات~Sugar cubes
eg|food.spices|سكر الأسرة مصر~Al Osra Egypt|سكر~Sugar;سكر بودرة~Icing sugar
b|food.breakfast|نوتيلا~Nutella|شوكولاتة بالبندق للدهن~Hazelnut spread
b|food.breakfast|كيلوقز~Kellogg's|كورن فليكس~Corn Flakes;سبيشل كي~Special K;كوكو بوبس~Coco Pops;فروستيز~Frosties;ألياف بران~All-Bran;رايس كرسبيز~Rice Krispies
b|food.breakfast|نستله حبوب~Nestlé Cereals|فيتنس~Fitness;شوكابيك~Chocapic;نسكويك سيريال~Nesquik cereal;كورن فليكس~Corn flakes;سيريلاك~Cerelac
b|food.breakfast|الشهد~Al Shahd|عسل سدر~Sidr honey;عسل طبيعي~Natural honey
b|food.breakfast|لانجنيز~Langnese|عسل~Honey
b|food.breakfast|الريحاني~Al Rayhani|حلاوة طحينية~Halawa;طحينة~Tahini
b|food.breakfast|الأمير~Al Ameer|حلاوة طحينية~Halawa;طحينة~Tahini
b|food.breakfast|فرشلي~Freshly Spreads|زبدة فول سوداني~Peanut butter;شوكولاتة للدهن~Chocolate spread
b|food.breakfast|-~-|شوفان~Oats;جرانولا~Granola;موسلي~Muesli
b|food.breakfast|-~-|تمر سكري~Sukkari dates;تمر خلاص~Khalas dates;تمر عجوة~Ajwa dates;تمر صقعي~Safawi dates;تمر مجدول~Medjool dates;تمر سيوي~Siwi dates;عجوة معجون~Date paste
sa|food.breakfast|باتيل~Bateel|تمر فاخر~Premium dates;تمر محشي~Stuffed dates
sa|food.breakfast|-~-|تمر عجوة~Ajwa;تمر سكري~Sukkari;تمر صفاوي~Safawi
eg|food.breakfast|حلاوة الرشيدي الميزان~El Rashidi El Mizan|حلاوة طحينية~Halawa;طحينة~Tahini;عسل أسود~Molasses;مربى~Jam
eg|food.breakfast|-~-|فول مدشوش~Crushed fava;فول حصاوي~Hasawi fava;فول صعيدي~Saidi fava
b|food.snacks|ليز~Lay's|شيبس ملح~Salted chips;شيبس شطة وليمون~Chili & lime chips;شيبس خل وملح~Salt & vinegar chips;شيبس جبنة~Cheese chips;شيبس بابريكا~Paprika chips;شيبس مشوي~Baked chips;شيبس كتشب~Ketchup chips
b|food.snacks|دوريتوس~Doritos|ناتشو جبنة~Nacho cheese;شطة~Chili;صلصة~Salsa
b|food.snacks|برينجلز~Pringles|أصلي~Original;كريمة وبصل~Sour cream & onion;باربكيو~BBQ;جبنة~Cheese;حار~Hot & spicy
eg|food.snacks|شيبسي~Chipsy|شيبس ملح~Salted chips;شيبس طماطم~Tomato chips;شيبس شطة وليمون~Chili & lemon;شيبس جبنة~Cheese chips;شيبس خل وملح~Salt & vinegar;شيبسي مشوي~Baked chips;دوريتوس~Doritos
eg|food.snacks|إيديتا~Edita|كيك تودو~Todo cake;مولتو~Molto croissant;مولتو ماجنم~Molto Magnum;هوهوز~HoHos;توينكيز~Twinkies;بيك رولز~Bake Rolz;فريسكا~Freska;توتي~Tiger tail
eg|food.snacks|بسكو مصر~Bisco Misr|بسكويت بالسمسم~Sesame biscuits;بسكويت ماري~Marie biscuits;بسكويت شاي~Tea biscuits;بسكويت بالشوكولاتة~Chocolate biscuits;كوكيز~Cookies;ويفر~Wafers;مارشملو~Marshmallow
eg|food.snacks|كورونا~Corona|شوكولاتة بالبندق~Hazelnut chocolate;شوكولاتة باللبن~Milk chocolate;شوكولاتة دارك~Dark chocolate;كاكاو~Cocoa
eg|food.snacks|أبو عوف~Abu Auf|مكسرات مشكلة~Mixed nuts;لوز~Almonds;كاجو~Cashews;فستق~Pistachios;بن~Coffee;شاي أعشاب~Herbal tea;شوكولاتة~Chocolate;تمر~Dates;زبيب~Raisins;عسل~Honey
b|food.snacks|كادبوري~Cadbury|ديري ميلك~Dairy Milk;فلايك~Flake;فايف ستار~5 Star;بيكنك~Picnic;أصابع~Fingers
b|food.snacks|جالكسي~Galaxy|شوكولاتة باللبن~Milk chocolate;شوكولاتة بالبندق~Hazelnut;جالكسي فلوتس~Flutes;جالكسي كراميل~Caramel
b|food.snacks|كيت كات~KitKat|كيت كات 4 أصابع~4 fingers;كيت كات تشانكي~Chunky;كيت كات ميني~Minis
b|food.snacks|سنيكرز~Snickers|سنيكرز~Snickers bar;سنيكرز ميني~Minis
b|food.snacks|مارس~Mars|مارس~Mars bar;باونتي~Bounty;تويكس~Twix;إم آند إمز~M&M's
b|food.snacks|أوريو~Oreo|أوريو أصلي~Original;أوريو فانيليا~Vanilla;أوريو شوكولاتة~Chocolate
b|food.snacks|ماكفيتيز~McVitie's|دايجستف~Digestive;دايجستف شوكولاتة~Chocolate digestive;هوب نوبز~Hobnobs
b|food.snacks|لوكر~Loacker|ويفر بالبندق~Hazelnut wafer;ويفر بالشوكولاتة~Chocolate wafer;ويفر بالفانيليا~Vanilla wafer
b|food.snacks|توبليرون~Toblerone|شوكولاتة باللبن~Milk chocolate
b|food.snacks|ليندت~Lindt|شوكولاتة دارك 70%~70% dark chocolate;شوكولاتة باللبن~Milk chocolate;ليندور~Lindor
b|food.snacks|فيريرو~Ferrero|فيريرو روشيه~Ferrero Rocher;كيندر شوكولاتة~Kinder Chocolate;كيندر بوينو~Kinder Bueno;كيندر جوي~Kinder Joy;تيك تاك~Tic Tac
b|food.snacks|-~-|كعك أرز~Rice cakes;شوفان بار~Oat bar;بروتين بار~Protein bar;مكسرات نيئة~Raw nuts;فشار~Popcorn;شيبس خضار~Veggie chips
sa|food.snacks|بيارا~Bayara|مكسرات مشكلة~Mixed nuts;فستق حلبي~Pistachios;لوز~Almonds;كاجو~Cashews;حمص محمص~Roasted chickpeas;زبيب~Raisins
sa|food.snacks|سنيورة~Siniora|مرتديلا~Mortadella;لانشون~Luncheon
b|food.frozen|ساديا مجمدات~Sadia Frozen|سمبوسة لحم~Meat samosa;سمبوسة جبن~Cheese samosa;سبرينج رول~Spring rolls;بيتزا~Pizza;بطاطس مقلية~French fries
b|food.frozen|ماكين~McCain|بطاطس مقلية~French fries;بطاطس ودجز~Potato wedges;هاش براون~Hash browns;بطاطس رفيعة~Shoestring fries
b|food.frozen|لامب ويستون~Lamb Weston|بطاطس مقلية~French fries
b|food.frozen|كيه دي دي~KDD|آيس كريم~Ice cream;عصير~Juice;حليب~Milk
b|food.frozen|باسكن روبنز~Baskin Robbins|آيس كريم~Ice cream
b|food.frozen|هاجن داز~Häagen-Dazs|آيس كريم فانيليا~Vanilla;آيس كريم شوكولاتة~Chocolate;آيس كريم فراولة~Strawberry
b|food.frozen|كورنيتو~Cornetto|آيس كريم كون~Ice cream cone
b|food.frozen|ماجنوم~Magnum|آيس كريم ماجنوم كلاسيك~Classic;ماجنوم لوز~Almond
eg|food.frozen|نستله آيس كريم~Nestlé Ice Cream|آيس كريم~Ice cream;آيس كريم ميجا~Mega
eg|food.frozen|-~-|بسلة وجزر~Peas & carrots;ملوخية~Molokhia;بامية~Okra;فاصوليا خضرا~Green beans;خرشوف~Artichoke;سبانخ~Spinach;خضار مشكل~Mixed vegetables;بطاطس~Potatoes
eg|food.frozen|بونديل~Bonduelle|ذرة~Sweet corn;بسلة~Peas;خضار~Vegetables
sa|food.frozen|الوطنية مجمدات~Al Watania Frozen|ناجتس~Nuggets;برجر~Burger;شاورما~Shawarma
b|food.bakery|-~-|عيش بلدي~Baladi bread;عيش فينو~Fino bread;عيش شامي~Shami bread;عيش سن~Bran bread;توست~Toast;كعك~Ka'ak;قرص~Qorss;شابورة~Rusks;بقسماط~Breadcrumbs;خبز تنور~Tannour bread;خبز تميس~Tamees;خبز صاج~Saj bread;خبز بر~Brown bread;خبز شعير~Barley bread
b|drinks.water|نوفا~Nova|مياه شرب~Drinking water;مياه صغيرة~Small bottles;مياه 5 جالون~5-gallon water
b|drinks.water|بيرين~Berain|مياه شرب~Drinking water;مياه صغيرة~Small bottles
sa|drinks.water|هنا~Hana|مياه شرب~Drinking water
sa|drinks.water|أكوافينا~Aquafina|مياه شرب~Drinking water
sa|drinks.water|نستله بيور لايف~Nestlé Pure Life|مياه شرب~Drinking water
sa|drinks.water|تانيا~Tania|مياه شرب~Drinking water
sa|drinks.water|العين~Al Ain|مياه شرب~Drinking water
sa|drinks.water|إيفيان~Evian|مياه معدنية~Mineral water
sa|drinks.water|زمزم~Zamzam|ماء زمزم~Zamzam water
eg|drinks.water|بركة~Baraka|مياه معدنية~Mineral water
eg|drinks.water|نستله مصر~Nestlé Egypt Water|مياه معدنية~Mineral water
eg|drinks.water|أكوافينا مصر~Aquafina Egypt|مياه شرب~Drinking water
eg|drinks.water|حياة~Hayat|مياه معدنية~Mineral water
eg|drinks.water|سيوة~Siwa|مياه معدنية~Mineral water
eg|drinks.water|داساني~Dasani|مياه شرب~Drinking water
eg|drinks.water|صافي~Safi|مياه معدنية~Mineral water
b|drinks.soft|بيبسي~Pepsi|بيبسي~Pepsi;بيبسي دايت~Diet Pepsi;بيبسي بدون سكر~Pepsi Zero;ميرندا برتقال~Mirinda orange;ميرندا تفاح~Mirinda apple;سفن أب~7Up;سفن أب دايت~7Up Diet;ماونتن ديو~Mountain Dew
b|drinks.soft|كوكاكولا~Coca-Cola|كوكاكولا~Coca-Cola;كوكاكولا زيرو~Coke Zero;كوكاكولا لايت~Coke Light;فانتا برتقال~Fanta orange;فانتا فراولة~Fanta strawberry;سبرايت~Sprite;سبرايت زيرو~Sprite Zero
b|drinks.soft|ريد بول~Red Bull|مشروب طاقة~Energy drink;بدون سكر~Sugar-free
b|drinks.soft|باربيكان~Barbican|بيرة شعير بالرمان~Pomegranate malt;شعير بالتفاح~Apple malt;شعير بالفراولة~Strawberry malt;شعير بالليمون~Lemon malt
b|drinks.soft|موسي~Moussy|شعير بالتفاح~Apple malt;شعير بالخوخ~Peach malt;شعير بالرمان~Pomegranate malt
b|drinks.soft|فيمتو~Vimto|شراب فيمتو مركز~Vimto cordial;فيمتو علب~Vimto cans
b|drinks.soft|تانج~Tang|بودرة برتقال~Orange powder;بودرة مانجو~Mango powder;بودرة ليمون~Lemon powder;بودرة مشمش~Apricot powder
b|drinks.soft|راني~Rani|عصير بقطع البرتقال~Orange with bits;عصير بقطع الأناناس~Pineapple with bits;عصير بقطع الخوخ~Peach with bits;عصير بقطع الجوافة~Guava with bits
b|drinks.soft|بيريه~Perrier|مياه فوارة~Sparkling water
b|drinks.soft|كودرد~Code Red|مشروب طاقة~Energy drink
b|drinks.soft|مونستر~Monster|مشروب طاقة~Energy drink;بدون سكر~Zero sugar
eg|drinks.soft|فيروز~Fayrouz|شعير بالأناناس~Pineapple malt;شعير بالتفاح~Apple malt;شعير بالمانجو~Mango malt
eg|drinks.soft|بيج كولا~Big Cola|كولا~Cola
eg|drinks.soft|في كولا~V7|كولا~Cola
b|drinks.juice|الربيع~Al Rabie|عصير برتقال~Orange juice;عصير مانجو~Mango juice;عصير تفاح~Apple juice;عصير عنب~Grape juice;عصير أناناس~Pineapple juice;عصير كوكتيل~Cocktail juice;عصير جوافة~Guava juice;عصير فراولة وموز~Strawberry banana;حليب بالشوكولاتة~Chocolate milk
b|drinks.juice|سن توب~Suntop|عصير برتقال~Orange juice;عصير مانجو~Mango juice;عصير تفاح~Apple juice;عصير أناناس~Pineapple juice;عصير بلاك كرنت~Blackcurrant juice
b|drinks.juice|سيزر~Ceres|عصير برتقال~Orange juice;عصير تفاح~Apple juice;عصير عنب~Grape juice;عصير مشكل~Medley juice
b|drinks.juice|نادك عصائر~Nadec Juice|عصير برتقال~Orange juice;عصير مانجو~Mango juice
b|drinks.juice|سن كويك~Sunquick|شراب برتقال مركز~Orange concentrate;شراب مانجو~Mango concentrate;شراب أناناس~Pineapple concentrate;شراب ليمون~Lemon concentrate
b|drinks.juice|كابري سون~Capri-Sun|عصير برتقال~Orange;عصير مشكل~Mixed fruit
sa|drinks.juice|الصافي عصائر~Al Safi Juice|عصير برتقال~Orange juice;عصير تفاح~Apple juice;عصير مانجو~Mango juice
eg|drinks.juice|بيتي عصائر~Beyti Juice|عصير برتقال~Orange;عصير مانجو~Mango;عصير جوافة~Guava;عصير كوكتيل~Cocktail
eg|drinks.juice|ليبتون آيس تي~Lipton Ice Tea|آيس تي خوخ~Peach ice tea;آيس تي ليمون~Lemon ice tea
b|drinks.hot|ليبتون~Lipton|شاي أكياس~Tea bags;شاي ناعم~Loose black tea;شاي أخضر~Green tea;شاي أخضر بالنعناع~Green tea mint;شاي أخضر بالليمون~Green tea lemon;شاي بالنعناع~Mint tea;شاي ليبتون ترتيب~Yellow Label;شاي إيرل جراي~Earl Grey
b|drinks.hot|ربيع~Rabea|شاي أكياس~Tea bags;شاي ناعم~Loose tea;شاي أخضر~Green tea;شاي بالهيل~Cardamom tea
b|drinks.hot|الكبوس~Alkbous|شاي~Tea;شاي بالهيل~Cardamom tea;شاي أخضر~Green tea
b|drinks.hot|أحمد تي~Ahmad Tea|شاي إنجليزي~English tea;شاي بالهيل~Cardamom tea;شاي إيرل جراي~Earl Grey;شاي أخضر~Green tea
b|drinks.hot|نسكافيه~Nescafé|نسكافيه كلاسيك~Classic;نسكافيه جولد~Gold;نسكافيه 3 في 1~3in1;نسكافيه ريد ميج~Red Mug;نسكافيه كابتشينو~Cappuccino;نسكافيه موكا~Mocha;نسكافيه منزوع الكافيين~Decaf
b|drinks.hot|كوفي ميت~Coffee-mate|مبيض قهوة~Coffee creamer
b|drinks.hot|نسبريسو~Nespresso|كبسولات قهوة~Coffee capsules
b|drinks.hot|دولتشي جوستو~Dolce Gusto|كبسولات قهوة~Coffee capsules;كبسولات كابتشينو~Cappuccino capsules
b|drinks.hot|لافازا~Lavazza|بن إسبريسو~Espresso coffee;بن مطحون~Ground coffee;حبوب قهوة~Coffee beans
b|drinks.hot|ستاربكس~Starbucks|قهوة مطحونة~Ground coffee;حبوب قهوة~Coffee beans;كبسولات~Capsules
b|drinks.hot|نسكويك~Nesquik|كاكاو بالحليب~Chocolate milk powder
b|drinks.hot|ميلو~Milo|مشروب الشوكولاتة~Chocolate malt drink
b|drinks.hot|جالكسي هوت شوكلت~Galaxy|شوكولاتة ساخنة~Hot chocolate
b|drinks.hot|الحسيني~Al Hussaini|بن~Coffee
sa|drinks.hot|العميد~Al Ameed|قهوة عربية~Arabic coffee;قهوة تركية~Turkish coffee;قهوة بالهيل~Coffee with cardamom
sa|drinks.hot|-~-|قهوة سعودية شقراء~Light Saudi coffee;قهوة سعودية بالزعفران~Saudi coffee saffron;قهوة خولاني~Khawlani coffee
sa|drinks.hot|دانكن~Dunkin'|قهوة مطحونة~Ground coffee
eg|drinks.hot|العروسة~El Arosa|شاي ناعم~Loose tea;شاي أكياس~Tea bags;شاي أخضر~Green tea;شاي كشري~Kushari tea
eg|drinks.hot|ليبتون مصر~Lipton Egypt|شاي ناعم~Loose tea;شاي أكياس~Tea bags;شاي أخضر~Green tea
eg|drinks.hot|بروك بوند~Brooke Bond|شاي~Tea
eg|drinks.hot|-~-|بن محوج~Spiced coffee;بن سادة~Plain coffee;بن فاتح~Light roast;بن غامق~Dark roast;قهوة فرنساوي~French coffee
eg|drinks.hot|بن أبو عوف~Abu Auf Coffee|بن تركي~Turkish coffee;قهوة فرنساوي~French coffee;قهوة إسبريسو~Espresso
eg|drinks.hot|-~-|ينسون~Aniseed;كركديه~Hibiscus;حلبة~Fenugreek;قرفة~Cinnamon tea;كراوية~Caraway;شاي أعشاب~Herbal tea;سحلب~Sahlab
eg|drinks.hot|إيزيس أعشاب~ISIS Herbs|ينسون~Aniseed;بابونج~Camomile;كركديه~Hibiscus;نعناع~Mint;شاي أخضر~Green tea;شاي أعشاب للتخسيس~Slimming herbs
eg|drinks.hot|-~-|سحلب~Sahlab;بليلة~Belila
b|drinks.dairydrinks|-~-|لبن رايب~Rayeb;عيران~Ayran;ميلك شيك~Milkshake;قهوة مثلجة~Iced coffee;مشروب بروتين~Protein shake
b|meds.pain|بنادول~Panadol|بنادول أدفانس~Panadol Advance;بنادول إكسترا~Panadol Extra;بنادول نايت~Panadol Night;بنادول كولد آند فلو~Panadol Cold & Flu;بنادول للأطفال شراب~Panadol Baby syrup;بنادول جوينت~Panadol Joint;بنادول للدورة~Panadol Menstrual
sa|meds.pain|أدول~Adol|أدول 500~Adol 500 mg;أدول شراب أطفال~Adol paediatric syrup;أدول تحاميل~Adol suppositories;أدول إكسترا~Adol Extra
sa|meds.pain|فيفادول~Fevadol|فيفادول أقراص~Fevadol tablets;فيفادول شراب~Fevadol syrup;فيفادول إكسترا~Fevadol Extra
b|meds.pain|بروفين~Brufen|بروفين 400~Brufen 400;بروفين شراب أطفال~Brufen syrup;بروفين جل~Brufen gel
b|meds.pain|أدفيل~Advil|أدفيل أقراص~Advil tablets;أدفيل للأطفال~Advil Children
b|meds.pain|نوروفين~Nurofen|نوروفين أقراص~Nurofen tablets;نوروفين أطفال~Nurofen for Children
b|meds.pain|فولتارين~Voltaren|فولتارين جل~Voltaren Emulgel;فولتارين لصقات~Voltaren patches
b|meds.pain|ديب هيت~Deep Heat|كريم ديب هيت~Deep Heat cream;سبراي~Spray;لصقات~Patches;ديب فريز~Deep Freeze
b|meds.pain|تايجر بالم~Tiger Balm|تايجر بالم أحمر~Red;تايجر بالم أبيض~White
b|meds.pain|سولبادين~Solpadeine|سولبادين فوار~Solpadeine soluble
b|meds.pain|أسبرين~Aspirin|أسبرين 81~Aspirin 81 mg;أسبرين 500~Aspirin 500 mg
eg|meds.pain|بروفينال~Profinal|بروفينال 400~Profinal 400;بروفينال شراب~Profinal syrup
eg|meds.pain|سيتال~Cetal|سيتال أقراص~Cetal tablets;سيتال شراب~Cetal syrup;سيتال تحاميل~Cetal suppositories
eg|meds.pain|أبيمول~Abimol|أبيمول أقراص~Abimol tablets;أبيمول شراب~Abimol syrup
eg|meds.pain|ريفو~Rivo|ريفو أقراص~Rivo tablets
eg|meds.pain|نوفالجين~Novalgin|نوفالجين أقراص~Novalgin tablets;نوفالجين أمبولات~Novalgin ampoules
eg|meds.pain|كيتوفان~Ketofan|كيتوفان كبسول~Ketofan capsules
eg|meds.pain|موف~Mov|موف جل~Mov gel
b|meds.cold|ستربسلز~Strepsils|أقراص استحلاب عسل وليمون~Honey & lemon lozenges;ستربسلز بدون سكر~Sugar-free;ستربسلز إكسترا~Extra;ستربسلز برتقال~Orange
b|meds.cold|أوتريفين~Otrivin|بخاخ أنف كبار~Adult nasal spray;نقط أنف أطفال~Paediatric drops;أوتريفين مالح~Saline spray
b|meds.cold|فيكس~Vicks|فيكس فابوروب~VapoRub;فيكس إنهيلر~Inhaler;أقراص فيكس~Vicks drops
b|meds.cold|سينوتاب~Sinutab|سينوتاب أقراص~Sinutab tablets
b|meds.cold|كلارتين~Clarityn|كلارتين أقراص~Clarityn tablets;كلارتين شراب~Clarityn syrup
b|meds.cold|زيرتك~Zyrtec|زيرتك أقراص~Zyrtec tablets;زيرتك شراب~Zyrtec syrup
b|meds.cold|بروسبان~Prospan|شراب كحة بروسبان~Prospan cough syrup
b|meds.cold|سيلين~Physiomer|محلول ملحي للأنف~Saline nasal spray
b|meds.cold|كتافلام~Cataflam|كتافلام 50~Cataflam 50
eg|meds.cold|كونجستال~Congestal|كونجستال أقراص~Congestal tablets;كونجستال شراب~Congestal syrup
eg|meds.cold|كومتركس~Comtrex|كومتركس أقراص~Comtrex tablets
eg|meds.cold|توبليكسيل~Toplexil|شراب كحة~Cough syrup
eg|meds.cold|برونشيكم~Bronchicum|شراب كحة~Cough syrup
eg|meds.cold|أسكوريل~Ascoril|شراب كحة~Cough syrup
eg|meds.cold|ميوكوسولفان~Mucosolvan|شراب طارد للبلغم~Expectorant syrup
eg|meds.cold|سي ريتارد~C-Retard|فيتامين سي~Vitamin C
eg|meds.cold|إيمودون~Imudon|أقراص استحلاب للحلق~Throat lozenges
sa|meds.cold|أكتيفيد~Actifed|أكتيفيد شراب~Actifed syrup;أكتيفيد أقراص~Actifed tablets
b|meds.stomach|جافيسكون~Gaviscon|جافيسكون شراب~Gaviscon liquid;أقراص مضغ~Chewable tablets;جافيسكون أدفانس~Gaviscon Advance
b|meds.stomach|رينيه~Rennie|أقراص مضغ رينيه~Rennie chewables
b|meds.stomach|إينو~Eno|فوار إينو ليمون~Eno lemon;إينو عادي~Eno regular
b|meds.stomach|إيموديوم~Imodium|إيموديوم كبسول~Imodium capsules
b|meds.stomach|دولكولاكس~Dulcolax|أقراص ملينة~Laxative tablets;تحاميل~Suppositories
b|meds.stomach|سميكتا~Smecta|أكياس سميكتا~Smecta sachets
b|meds.stomach|بوسكوبان~Buscopan|بوسكوبان أقراص~Buscopan tablets
b|meds.stomach|ميلانتا~Mylanta|ميلانتا شراب~Mylanta liquid
b|meds.stomach|ماالوكس~Maalox|ماالوكس شراب~Maalox suspension;أقراص~Tablets
b|meds.stomach|محلول معالجة الجفاف~ORS|محلول جفاف أكياس~Oral rehydration sachets
eg|meds.stomach|أنتينال~Antinal|أنتينال كبسول~Antinal capsules;أنتينال شراب~Antinal syrup
eg|meds.stomach|سبازموكانيولاز~Spasmo-Canulase|أقراص~Tablets
eg|meds.stomach|ديجستن~Digestin|أقراص هضم~Digestion tablets
eg|meds.stomach|فلاجيل~Flagyl|فلاجيل أقراص~Flagyl tablets;فلاجيل شراب~Flagyl syrup
eg|meds.stomach|موتيليوم~Motilium|موتيليوم أقراص~Motilium tablets
eg|meds.stomach|ريهيدران~Rehydran|محلول جفاف~Rehydration salts
eg|meds.stomach|كولونا~Colona|أقراص للقولون~IBS tablets
eg|meds.stomach|-~-|فوار فواكه~Fruit salts
sa|meds.stomach|سيمكو~Simeco|أقراص مضغ للحموضة~Antacid chewables
b|meds.firstaid|ديتول~Dettol|مطهر ديتول~Antiseptic liquid;ديتول كريم~Antiseptic cream;صابون ديتول~Dettol soap;ديتول سائل لليدين~Dettol hand wash;ديتول معقم يدين~Hand sanitiser;مناديل ديتول~Dettol wipes;ديتول للغسيل~Laundry sanitiser;ديتول بخاخ~Disinfectant spray
b|meds.firstaid|هانزابلاست~Hansaplast|لاصق جروح~Plasters;لاصق ضد الماء~Waterproof plasters;شاش~Gauze;لصقة فقاعات~Blister plasters
b|meds.firstaid|بيتادين~Betadine|بيتادين محلول~Betadine solution;بيتادين مرهم~Ointment;غرغرة~Gargle
b|meds.firstaid|بيبانثين~Bepanthen|كريم بيبانثين~Bepanthen cream;مرهم الحفاضات~Nappy ointment
b|meds.firstaid|سودوكريم~Sudocrem|كريم سودوكريم~Sudocrem cream
b|meds.firstaid|فيوسيدين~Fucidin|كريم فيوسيدين~Fucidin cream
b|meds.firstaid|ميبو~MEBO|مرهم الحروق~Burn ointment
b|meds.firstaid|ثري إم~3M|شريط طبي~Medical tape;كمامات~Face masks
b|meds.firstaid|-~-|ترمومتر ديجيتال~Digital thermometer;ترمومتر جبهة~Forehead thermometer
eg|meds.firstaid|ديرماتين~Dermatin|كريم فطريات~Antifungal cream
eg|meds.firstaid|-~-|كحول طبي 70%~70% rubbing alcohol;قطن طبي~Cotton wool;مياه أكسجين~Hydrogen peroxide
b|meds.devices|أومرون~Omron|جهاز ضغط ذراع~Arm BP monitor;جهاز ضغط معصم~Wrist BP monitor;جهاز بخار~Nebuliser;ترمومتر~Thermometer
b|meds.devices|أكيوتشيك~Accu-Chek|جهاز سكر~Glucose meter;شرائط سكر~Test strips;إبر وخز~Lancets
b|meds.devices|ون تاتش~OneTouch|جهاز سكر~Glucose meter;شرائط سكر~Test strips
b|meds.devices|كونتور~Contour|جهاز سكر~Glucose meter;شرائط سكر~Test strips
b|meds.devices|بيورير~Beurer|ميزان ذكي~Smart scale;جهاز ضغط~BP monitor;ترمومتر~Thermometer;جهاز أكسجين أصبع~Pulse oximeter
b|meds.devices|براون~Braun|ترمومتر أذن~Ear thermometer;ترمومتر جبهة~Forehead thermometer
b|meds.devices|كلير بلو~Clearblue|اختبار حمل~Pregnancy test;اختبار حمل ديجيتال~Digital pregnancy test;اختبار تبويض~Ovulation test
b|meds.vitamins|سنتروم~Centrum|سنتروم متعدد~Centrum multivitamin;سنتروم سيلفر~Centrum Silver;سنتروم للرجال~Centrum Men;سنتروم للنساء~Centrum Women
b|meds.vitamins|فارماتون~Pharmaton|فارماتون كبسول~Pharmaton capsules
b|meds.vitamins|سوبرادين~Supradyn|سوبرادين أقراص~Supradyn tablets;سوبرادين فوار~Supradyn effervescent
b|meds.vitamins|ريدوكسون~Redoxon|فيتامين سي فوار~Vitamin C effervescent;ريدوكسون دبل أكشن~Double Action
b|meds.vitamins|برجنكير~Pregnacare|برجنكير أصلي~Original;برجنكير بلس~Plus;برجنكير للرضاعة~Breast-feeding
b|meds.vitamins|ويلمن~Wellman|ويلمن أقراص~Wellman tablets
b|meds.vitamins|ويلومن~Wellwoman|ويلومن أقراص~Wellwoman tablets
b|meds.vitamins|ناتشرز باونتي~Nature's Bounty|أوميجا 3~Omega-3;فيتامين د3~Vitamin D3;بيوتين~Biotin;كالسيوم~Calcium;مغنيسيوم~Magnesium;زنك~Zinc;حديد~Iron;فيتامين ب12~Vitamin B12
b|meds.vitamins|ناو فودز~NOW Foods|فيتامين د3~Vitamin D3;مغنيسيوم~Magnesium;أوميجا 3~Omega-3;زنك~Zinc
b|meds.vitamins|سولجار~Solgar|فيتامين د3~Vitamin D3;حديد~Iron;أوميجا 3~Omega-3;فوليك أسيد~Folic acid
b|meds.vitamins|فيتابيوتكس~Vitabiotics|فيتامين د~Vitamin D;أوستيوكير~Osteocare;فيروجلوبين~Feroglobin;برفكتيل~Perfectil
b|meds.vitamins|سانفيتال~Sanvital|فيتامينات~Vitamins
eg|meds.vitamins|ديفارول~Devarol|ديفارول أمبول~Devarol ampoule;ديفارول نقط~Devarol drops
eg|meds.vitamins|أوكتوفيت~Octofit|فيتامينات~Multivitamin
eg|meds.vitamins|ميجا 3~Mega 3|أوميجا 3~Omega-3
eg|meds.vitamins|-~-|فيتامين د3 نقط~D3 drops;فيتامين د3 كبسول~D3 capsules
eg|meds.vitamins|نيوروبيون~Neurobion|نيوروبيون أقراص~Neurobion tablets;نيوروبيون أمبول~Neurobion ampoules
eg|meds.vitamins|ميلجا~Milga|ميلجا أقراص~Milga tablets
eg|meds.vitamins|فيتاسي~Vitacid C|فيتامين سي~Vitamin C
eg|meds.vitamins|كالسيوم ساندوز~Calcium Sandoz|كالسيوم فوار~Calcium effervescent
eg|meds.vitamins|-~-|زنك أقراص~Zinc tablets
b|meds.chronic|-~-|إبر أنسولين~Insulin needles;قلم أنسولين~Insulin pen;شرائط كيتون~Ketone strips;حقيبة تبريد أنسولين~Insulin cooling bag
b|meds.chronic|-~-|علبة أدوية أسبوعية~Weekly pill box;علبة أدوية شهرية~Monthly pill box;قطاعة أقراص~Pill cutter
b|meds.skin|نيفيا~Nivea|كريم نيفيا~Nivea Creme;نيفيا سوفت~Nivea Soft;لوشن جسم~Body lotion;مزيل عرق رجالي~Men's deodorant;مزيل عرق نسائي~Women's deodorant;كريم واقي شمس~Sunscreen;مرطب شفايف~Lip balm;غسول وجه~Face wash;كريم حلاقة~Shaving cream;بعد الحلاقة~After shave;شاور جل~Shower gel
b|meds.skin|فازلين~Vaseline|فازلين أصلي~Original jelly;لوشن فازلين~Vaseline lotion;فازلين للشفايف~Lip therapy
b|meds.skin|سيتافيل~Cetaphil|غسول لطيف~Gentle cleanser;كريم مرطب~Moisturising cream;لوشن مرطب~Moisturising lotion
b|meds.skin|سيرافي~CeraVe|غسول مرطب~Hydrating cleanser;كريم مرطب~Moisturising cream;غسول رغوي~Foaming cleanser;لوشن~Lotion
b|meds.skin|لاروش بوزيه~La Roche-Posay|واقي شمس أنثيليوس~Anthelios sunscreen;سيكابلاست~Cicaplast;إيفاكلار~Effaclar
b|meds.skin|بيوديرما~Bioderma|ماء ميسيلار~Micellar water;واقي شمس~Sunscreen;أتوديرم~Atoderm
b|meds.skin|يوسيرين~Eucerin|كريم يوسيرين~Eucerin cream;واقي شمس~Sunscreen;لوشن~Lotion
b|meds.skin|نيوتروجينا~Neutrogena|غسول وجه~Face wash;كريم أيدي~Hand cream;واقي شمس~Sunscreen;مرطب~Moisturiser
b|meds.skin|جونسون~Johnson's|شامبو أطفال~Baby shampoo;زيت أطفال~Baby oil;بودرة أطفال~Baby powder;لوشن أطفال~Baby lotion;صابون أطفال~Baby soap;مناديل أطفال~Baby wipes;كريم أطفال~Baby cream
b|meds.skin|بالمرز~Palmer's|كريم زبدة الكاكاو~Cocoa butter cream;كريم علامات تمدد~Stretch-mark cream
b|meds.skin|ميوستيلا~Mustela|كريم تسلخات~Nappy cream;غسول أطفال~Baby wash;كريم علامات تمدد~Stretch-mark cream
eg|meds.skin|ستار فيل~Starville|غسول~Cleanser;واقي شمس~Sunscreen;كريم تفتيح~Whitening cream
eg|meds.skin|إيفا~Eva|كريم إيفا~Eva cream;واقي شمس إيفا~Eva sunscreen;غسول إيفا~Eva cleanser;كولاجين إيفا~Eva collagen
eg|meds.skin|بانثينول~Panthenol|كريم بانثينول~Panthenol cream;سبراي~Spray
b|care.bath|لوكس~Lux|صابون لوكس~Lux soap;شاور جل~Body wash
b|care.bath|دوف~Dove|صابون دوف~Dove soap;شامبو دوف~Dove shampoo;بلسم دوف~Dove conditioner;شاور جل~Body wash;مزيل عرق~Deodorant;كريم~Cream;دوف للرجال~Men+Care
b|care.bath|بالموليف~Palmolive|صابون~Soap;شاور جل~Shower gel;شامبو~Shampoo
b|care.bath|لايفبوي~Lifebuoy|صابون~Soap;سائل غسيل يدين~Hand wash
b|care.bath|هيد آند شولدرز~Head & Shoulders|شامبو كلاسيك~Classic clean;شامبو منثول~Menthol;شامبو 2 في 1~2in1;شامبو للشعر الدهني~Oily hair;شامبو للرجال~Men
b|care.bath|بانتين~Pantene|شامبو~Shampoo;بلسم~Conditioner;زيت شعر~Hair oil;كريم شعر~Hair cream;ماسك شعر~Hair mask
b|care.bath|صنسيلك~Sunsilk|شامبو~Shampoo;بلسم~Conditioner;كريم شعر~Hair cream
b|care.bath|كلير~Clear|شامبو ضد القشرة~Anti-dandruff shampoo;شامبو للرجال~Men's shampoo
b|care.bath|لوريال~L'Oréal|شامبو إلفيف~Elvive shampoo;بلسم إلفيف~Elvive conditioner;صبغة شعر~Hair dye;كريم شعر~Hair cream;غسول وجه~Face wash
b|care.bath|هيربال إيسنسز~Herbal Essences|شامبو~Shampoo;بلسم~Conditioner
b|care.bath|غارنييه~Garnier|شامبو فروكتيس~Fructis shampoo;ماء ميسيلار~Micellar water;صبغة شعر~Hair dye;ماسك~Mask;غسول~Cleanser
b|care.bath|شوارزكوف~Schwarzkopf|صبغة شعر~Hair colour;جل شعر~Hair gel;سبراي شعر~Hair spray
b|care.bath|هيمالايا~Himalaya|غسول وجه نيم~Neem face wash;شامبو~Shampoo;كريم أقدام~Foot cream;معجون أسنان~Toothpaste
b|care.bath|-~-|ليفة~Loofah;فوطة استحمام~Bath towel
b|care.oral|كولجيت~Colgate|معجون كولجيت~Colgate toothpaste;كولجيت تبييض~Whitening;كولجيت للأطفال~Kids;فرشاة أسنان~Toothbrush;غسول فم بلاكس~Plax mouthwash;خيط أسنان~Dental floss
b|care.oral|سيجنال~Signal|معجون سيجنال~Signal toothpaste;فرشاة أسنان~Toothbrush
b|care.oral|سنسوداين~Sensodyne|معجون للأسنان الحساسة~Sensitive toothpaste;سنسوداين تبييض~Whitening;سنسوداين ريباير~Repair & Protect
b|care.oral|أورال بي~Oral-B|فرشاة أسنان~Toothbrush;فرشاة كهربا~Electric toothbrush;رؤوس فرشاة~Replacement heads;خيط أسنان~Floss
b|care.oral|ليسترين~Listerine|غسول فم~Mouthwash;غسول فم بدون -~--free mouthwash
b|care.oral|كلوس أب~Closeup|معجون كلوس أب~Closeup toothpaste
b|care.oral|بارودونتاكس~Parodontax|معجون للثة~Gum toothpaste
b|care.oral|مسواك~Miswak|مسواك~Miswak stick;معجون بالمسواك~Miswak toothpaste
b|care.grooming|جيليت~Gillette|شفرات حلاقة~Razor blades;ماكينة حلاقة مارك 3~Mach3 razor;فيوجن~Fusion;جل حلاقة~Shaving gel;رغوة حلاقة~Shaving foam;ماكينة حلاقة استعمال مرة~Disposable razors
b|care.grooming|بيك~BIC|ماكينة حلاقة استعمال مرة~Disposable razors
b|care.grooming|براون~Braun Grooming|ماكينة حلاقة كهربا~Electric shaver;ماكينة تحديد ذقن~Beard trimmer;ماكينة إزالة شعر~Epilator
b|care.grooming|فيليبس~Philips Grooming|ماكينة تحديد ذقن~Beard trimmer;ماكينة حلاقة~Shaver;مجفف شعر~Hair dryer;مكواة شعر~Hair straightener
b|care.grooming|أكس~Axe|مزيل عرق~Deodorant;بخاخ جسم~Body spray;شاور جل~Shower gel
b|care.grooming|ريكسونا~Rexona|مزيل عرق رجالي~Men's deodorant;مزيل عرق نسائي~Women's deodorant;رول أون~Roll-on
b|care.grooming|أولد سبايس~Old Spice|مزيل عرق~Deodorant;بعد الحلاقة~After shave
b|care.grooming|بريل كريم~Brylcreem|كريم شعر~Hair cream;جل شعر~Hair gel
b|care.grooming|جاتسبي~Gatsby|واكس شعر~Hair wax;جل شعر~Hair gel;مناديل وجه~Face wipes
b|care.grooming|-~-|عطر رجالي~Men's perfume;عطر نسائي~Women's perfume;دهن عود~Oud oil;بخور~Bakhoor;معطر ملابس~Clothes freshener
sa|care.grooming|العربية للعود~Arabian Oud|عطر~Perfume;دهن عود~Oud oil;بخور~Bakhoor;معمول~Mamoul incense
sa|care.grooming|عبدالصمد القرشي~Abdul Samad Al Qurashi|عطر~Perfume;دهن عود~Oud oil;بخور~Bakhoor
sa|care.grooming|أجمل~Ajmal|عطر~Perfume;دهن عود~Oud oil
sa|care.grooming|لطافة~Lattafa|عطر~Perfume
sa|care.grooming|رصاصي~Rasasi|عطر~Perfume
sa|care.grooming|إبراهيم القرشي~Ibraheem Al Qurashi|عطر~Perfume;بخور~Bakhoor
b|care.women|أولويز~Always|فوط عادية~Normal pads;فوط ليلية~Night pads;فوط طويلة~Long pads;فوط يومية~Panty liners;أولويز ألترا~Ultra;أولويز قطن~Cotton
b|care.women|كوتكس~Kotex|فوط عادية~Normal pads;فوط ليلية~Night pads;فوط يومية~Panty liners;تامبون~Tampons
b|care.women|برايفت~Private|فوط~Pads;فوط ليلية~Night pads;فوط يومية~Liners
b|care.women|سانيتا~Sanita|فوط~Pads
b|care.women|فيت~Veet|كريم إزالة شعر~Hair-removal cream;شرائط شمع~Wax strips;جهاز إزالة شعر~Hair-removal device
b|care.women|ليدي سبيد ستيك~Lady Speed Stick|مزيل عرق~Deodorant
b|care.women|ميبيلين~Maybelline|ماسكارا~Mascara;كحل~Eyeliner;روج~Lipstick;فاونديشن~Foundation;كونسيلر~Concealer;بودرة~Powder
b|care.women|بورجوا~Bourjois|روج~Lipstick;بودرة~Powder;ماسكارا~Mascara
b|care.women|إسنس~Essence|ماسكارا~Mascara;طلاء أظافر~Nail polish;مزيل طلاء أظافر~Nail polish remover;روج~Lipstick
b|care.women|-~-|وسادة حمل~Pregnancy pillow;حزام بطن بعد الولادة~Postpartum belt;فوط بعد الولادة~Maternity pads;كريم حلمات~Nipple cream;وسادات صدر~Breast pads;شفاط حليب~Breast pump;أكياس حفظ حليب~Breast-milk bags
eg|care.women|بنات~Banat|فوط~Pads
eg|care.women|مولبيد~Molped|فوط~Pads;فوط ليلية~Night pads
eg|care.women|فلورا~Flora|فوط~Pads
b|care.paper|فاين~Fine|مناديل وجه~Facial tissues;ورق تواليت~Toilet roll;مناديل مطبخ~Kitchen towels;مناديل جيب~Pocket tissues;مناديل مبللة~Wet wipes;فاين بيبي~Fine Baby nappies
b|care.paper|كلينكس~Kleenex|مناديل وجه~Facial tissues;ورق تواليت~Toilet roll
b|care.paper|سنو وايت~Snow White|مناديل~Tissues;ورق تواليت~Toilet roll
b|care.paper|-~-|مناديل سفرة~Napkins;مناديل مطبخ~Kitchen roll
eg|care.paper|زينة~Zeina|مناديل وجه~Facial tissues;ورق تواليت~Toilet roll;مناديل مطبخ~Kitchen roll;مناديل جيب~Pocket tissues
eg|care.paper|فاميليا~Familia|مناديل وجه~Facial tissues;ورق تواليت~Toilet roll;مناديل مطبخ~Kitchen roll
b|clean.laundry|برسيل~Persil|برسيل بودرة~Persil powder;برسيل جل~Persil gel;برسيل أبايا~Persil Abaya shampoo;برسيل للغسالة الأوتوماتيك~Persil automatic;برسيل يدوي~Persil hand wash;كبسولات برسيل~Persil capsules
b|clean.laundry|تايد~Tide|تايد بودرة~Tide powder;تايد جل~Tide gel;تايد أوتوماتيك~Tide automatic;تايد يدوي~Tide hand wash;كبسولات تايد~Tide pods
b|clean.laundry|أريال~Ariel|أريال بودرة~Ariel powder;أريال جل~Ariel gel;أريال أوتوماتيك~Ariel automatic;كبسولات أريال~Ariel pods
b|clean.laundry|أومو~Omo|أومو بودرة~Omo powder;أومو جل~Omo liquid
b|clean.laundry|داوني~Downy|منعم ملابس~Fabric softener;داوني مركز~Concentrated softener;معطر ملابس حبيبات~Scent beads
b|clean.laundry|كمفورت~Comfort|منعم ملابس~Fabric softener;كمفورت مركز~Concentrate
b|clean.laundry|كلوروكس~Clorox|كلوروكس أبيض~Bleach;كلوروكس ألوان~Colour bleach;كلوروكس معطر~Scented bleach;مزيل بقع~Stain remover
b|clean.laundry|فانيش~Vanish|مزيل بقع بودرة~Stain remover powder;مزيل بقع سائل~Stain remover liquid;فانيش للأبيض~White
b|clean.laundry|-~-|نشا مكواة~Ironing starch
eg|clean.laundry|أوكسي~Oxi|أوكسي بودرة~Oxi powder;أوكسي أوتوماتيك~Oxi automatic;أوكسي سائل~Oxi liquid
eg|clean.laundry|بونكس~Bonux|بونكس بودرة~Bonux powder
eg|clean.laundry|فيبا~Feba|مسحوق غسيل~Washing powder
eg|clean.laundry|سوفتلان~Softlan|منعم ملابس~Fabric softener
b|clean.dishes|فيري~Fairy|سائل جلي ليمون~Lemon dish soap;سائل جلي أصلي~Original;أقراص غسالة الصحون~Dishwasher tablets;فيري بلاتينيوم~Platinum
b|clean.dishes|بريل~Pril|سائل جلي~Dish soap
b|clean.dishes|فينيش~Finish|أقراص غسالة صحون~Dishwasher tablets;ملح غسالة صحون~Dishwasher salt;ملمع~Rinse aid;منظف الغسالة~Machine cleaner
b|clean.dishes|سكوتش برايت~Scotch-Brite|سلك مواعين~Scourer;سفنج~Sponges;فوط مطبخ~Kitchen cloths;مساحة أرضيات~Mop
eg|clean.dishes|بريل مصر~Pril Egypt|سائل مواعين~Dish liquid
eg|clean.dishes|فيري مصر~Fairy Egypt|سائل مواعين~Dish liquid
b|clean.house|ديتول منظفات~Dettol Home|منظف أرضيات~Floor cleaner;مطهر متعدد~Multi-surface;منظف حمام~Bathroom cleaner;مناديل تطهير~Disinfectant wipes
b|clean.house|هاربيك~Harpic|منظف تواليت~Toilet cleaner;منظف حمام~Bathroom cleaner;أقراص سيفون~Cistern blocks
b|clean.house|ديتول بخاخ~Dettol Spray|بخاخ مطهر~Disinfectant spray
b|clean.house|مستر مسل~Mr Muscle|منظف مطبخ~Kitchen cleaner;منظف زجاج~Glass cleaner;مسلك مجاري~Drain unblocker;منظف أفران~Oven cleaner
b|clean.house|كولين~Colin|منظف زجاج~Glass cleaner
b|clean.house|فلاش~Flash|منظف أرضيات~Floor cleaner;منظف متعدد~All-purpose
b|clean.house|جيف~Jif|كريم تنظيف~Cream cleaner;منظف مطبخ~Kitchen spray
b|clean.house|بايجون~Baygon|مبيد حشرات بخاخ~Insect spray;مبيد صراصير~Cockroach killer;أقراص ناموس~Mosquito mats;جهاز ناموس كهربا~Plug-in repeller
b|clean.house|ريد~Raid|مبيد حشرات~Insect killer;مبيد نمل~Ant killer;مصيدة صراصير~Roach bait
b|clean.house|مورتين~Mortein|مبيد حشرات~Insect spray
b|clean.house|جلايد~Glade|معطر جو~Air freshener;معطر جو أوتوماتيك~Automatic freshener;معطر حمام~Bathroom freshener;شمع معطر~Scented candle
b|clean.house|إير ويك~Air Wick|معطر جو~Air freshener;معطر كهربا~Plug-in freshener
b|clean.house|بروكس~Pledge|ملمع خشب~Furniture polish
b|clean.house|سانيتا~Sanita|أكياس زبالة~Bin bags;أكياس زبالة كبيرة~Large bin bags;ورق ألومنيوم~Aluminium foil;ورق تغليف~Cling film;أكياس حفظ~Food bags;مناديل~Tissues;صحون فلين~Foam plates;أكواب ورق~Paper cups
b|clean.house|-~-|مناديل تنظيف~Cleaning wipes;مناديل أرضيات~Floor wipes
eg|clean.house|فلاش مصر~Flash Egypt|منظف أرضيات~Floor cleaner
eg|clean.house|ديتول مصر~Dettol Egypt|مطهر~Antiseptic
eg|clean.house|بيف باف~Pif Paf|مبيد حشرات~Insect spray
sa|clean.house|فالكن~Falcon|أكياس زبالة~Bin bags;ورق ألومنيوم~Foil;صحون بلاستيك~Plastic plates;أكواب~Cups;ملاعق بلاستيك~Plastic spoons;علب أكل~Food containers
b|baby.babycare|بامبرز~Pampers|حفاضات مقاس 1~Nappies size 1;حفاضات مقاس 2~Size 2;حفاضات مقاس 3~Size 3;حفاضات مقاس 4~Size 4;حفاضات مقاس 5~Size 5;حفاضات مقاس 6~Size 6;حفاضات بانتس~Pants;مناديل مبللة~Baby wipes;حفاضات حديثي الولادة~Newborn
b|baby.babycare|هجيز~Huggies|حفاضات مقاس 1~Size 1;حفاضات مقاس 2~Size 2;حفاضات مقاس 3~Size 3;حفاضات مقاس 4~Size 4;حفاضات مقاس 5~Size 5;حفاضات بانتس~Pants;مناديل مبللة~Wipes
b|baby.babycare|مولفكس~Molfix|حفاضات~Nappies;حفاضات بانتس~Pants;مناديل مبللة~Wipes
b|baby.babycare|بيبي جوي~BabyJoy|حفاضات~Nappies;مناديل~Wipes
b|baby.babycare|فاين بيبي~Fine Baby|حفاضات~Nappies;مناديل~Wipes
b|baby.babycare|سيميلاك~Similac|حليب أطفال مرحلة 1~Stage 1 formula;حليب مرحلة 2~Stage 2;حليب مرحلة 3~Stage 3;حليب للمغص~Comfort formula
b|baby.babycare|أبتاميل~Aptamil|حليب أطفال مرحلة 1~Stage 1;مرحلة 2~Stage 2;مرحلة 3~Stage 3
b|baby.babycare|نان~NAN|حليب أطفال مرحلة 1~Stage 1;مرحلة 2~Stage 2;مرحلة 3~Stage 3;نان مضاد للحساسية~HA
b|baby.babycare|بيبيلاك~Bebelac|حليب أطفال~Formula
b|baby.babycare|سيريلاك~Cerelac|سيريلاك قمح بالحليب~Wheat with milk;سيريلاك أرز~Rice;سيريلاك فواكه~Fruits;سيريلاك تمر~Dates
b|baby.babycare|جربر~Gerber|بيوريه فواكه~Fruit purée;بيوريه خضار~Veg purée;سناكس أطفال~Baby snacks
b|baby.babycare|أفنت~Philips Avent|رضاعة~Feeding bottle;حلمات رضاعة~Teats;سكاتة~Soother;جهاز تعقيم~Steriliser;شفاط حليب~Breast pump;كوب تدريب~Training cup
b|baby.babycare|تومي تيبي~Tommee Tippee|رضاعة~Bottle;سكاتة~Soother;كوب~Cup
b|baby.babycare|شيكو~Chicco|رضاعة~Bottle;سكاتة~Soother;عربية أطفال~Stroller;كرسي عربية~Car seat;شامبو أطفال~Baby shampoo
eg|baby.babycare|-~-|حليب أطفال مدعم~Subsidised formula
b|home.appliances|سامسونج~Samsung|غسالة~Washing machine;ثلاجة~Fridge;مكيف~Air conditioner;ميكروويف~Microwave;مكنسة كهربا~Vacuum cleaner;تلفزيون~TV
b|home.appliances|إل جي~LG|غسالة~Washing machine;ثلاجة~Fridge;مكيف~Air conditioner;ميكروويف~Microwave;تلفزيون~TV
b|home.appliances|فيليبس~Philips|مكواة~Iron;مكواة بخار~Steam iron;خلاط~Blender;قلاية هوائية~Air fryer;مكنسة~Vacuum;غلاية~Kettle;محضرة طعام~Food processor;لمبات ليد~LED bulbs
b|home.appliances|براون مطبخ~Braun Kitchen|خلاط يدوي~Hand blender;خلاط~Blender;مكواة~Iron
b|home.appliances|تيفال~Tefal|طقم حلل~Cookware set;مقلاة~Frying pan;قلاية هوائية~Air fryer;مكواة~Iron;غلاية~Kettle;حلة ضغط~Pressure cooker
b|home.appliances|مولينكس~Moulinex|خلاط~Blender;محضرة طعام~Food processor;مفرمة~Mincer;عجانة~Stand mixer
b|home.appliances|كينوود~Kenwood|عجانة~Stand mixer;خلاط~Blender;محضرة~Food processor;غلاية~Kettle
b|home.appliances|بلاك آند ديكر~Black+Decker|مثقاب~Drill;مكنسة يدوية~Hand vacuum;مكواة~Iron;محمصة~Toaster;خلاط~Blender
b|home.appliances|ديلونجي~De'Longhi|ماكينة قهوة~Coffee machine;دفاية~Heater
b|home.appliances|هوفر~Hoover|مكنسة كهربا~Vacuum cleaner
b|home.appliances|دايسون~Dyson|مكنسة لاسلكية~Cordless vacuum;مجفف شعر~Hair dryer
b|home.appliances|شارب~Sharp|ميكروويف~Microwave;ثلاجة~Fridge;غسالة~Washer
b|home.appliances|توشيبا~Toshiba|ثلاجة~Fridge;غسالة~Washer;ميكروويف~Microwave
sa|home.appliances|جيباس~Geepas|غلاية~Kettle;مكواة~Iron;خلاط~Blender;مروحة~Fan;سخان~Heater;شاحن~Charger
sa|home.appliances|جري~Gree|مكيف سبليت~Split AC;مكيف شباك~Window AC
sa|home.appliances|زامل~Zamil|مكيف~Air conditioner
eg|home.appliances|توشيبا العربي~Toshiba El Araby|غسالة~Washer;ثلاجة~Fridge;بوتاجاز~Cooker;سخان~Water heater;مكيف~AC;شاشة~TV
eg|home.appliances|فريش~Fresh|غسالة~Washer;ثلاجة~Fridge;بوتاجاز~Cooker;سخان~Water heater;مروحة~Fan;خلاط~Blender;مكواة~Iron
eg|home.appliances|يونيون إير~Unionaire|مكيف~AC;ثلاجة~Fridge;بوتاجاز~Cooker;سخان~Heater
eg|home.appliances|زانوسي~Zanussi|غسالة~Washer;ثلاجة~Fridge
eg|home.appliances|كريازي~Kiriazi|ثلاجة~Fridge;ديب فريزر~Deep freezer;غسالة~Washer;بوتاجاز~Cooker
eg|home.appliances|شارب العربي~Sharp El Araby|مكيف~AC;غسالة~Washer;ثلاجة~Fridge
eg|home.appliances|تورنيدو~Tornado|خلاط~Blender;غلاية~Kettle;مكواة~Iron;مروحة~Fan;ميكروويف~Microwave;شاشة~TV
eg|home.appliances|أوليمبيك~Olympic|سخان~Water heater;بوتاجاز~Cooker
eg|home.appliances|ميديا~Midea|مكيف~AC;غسالة~Washer
b|home.kitchenware|لومينارك~Luminarc|طقم أطباق~Dinner set;كاسات~Glasses;طقم شاي~Tea set
b|home.kitchenware|باشاباهتشه~Paşabahçe|كاسات~Glasses;فناجين~Cups;أطباق تقديم~Serving dishes;برطمانات~Jars
b|home.kitchenware|بايركس~Pyrex|صينية فرن زجاج~Glass oven dish;علب حفظ زجاج~Glass containers;مكيال~Measuring jug
b|home.kitchenware|تابروير~Tupperware|علب حفظ~Containers;زجاجة مية~Water bottle;علب لانش~Lunch boxes
b|home.kitchenware|-~-|ترمس قهوة~Coffee thermos;دلة~Dallah;ترمس شاي~Tea flask
sa|home.kitchenware|السيف غاليري~Al Saif Gallery|طقم حلل~Cookware;ترامس~Flasks;دلال~Dallahs
eg|home.kitchenware|زهران~Zahran|طقم حلل~Cookware;طاسة~Pan;حلة ضغط~Pressure cooker
b|home.electric|فيليبس إضاءة~Philips Lighting|لمبة ليد~LED bulb;كشاف~Floodlight;شريط ليد~LED strip
b|home.electric|دوراسيل~Duracell|حجارة AA~AA batteries;حجارة AAA~AAA batteries;حجارة 9 فولت~9V battery;بطارية زرار~Coin battery
b|home.electric|إنرجايزر~Energizer|حجارة AA~AA batteries;حجارة AAA~AAA batteries;كشاف~Torch
b|home.electric|أنكر~Anker|شاحن سريع~Fast charger;باور بانك~Power bank;كابل تايب سي~USB-C cable;كابل لايتننج~Lightning cable
b|home.electric|بيلكين~Belkin|شاحن~Charger;مشترك كهربا~Power strip;كابل~Cable
b|home.tools|بوش~Bosch|شنيور~Drill;صاروخ~Angle grinder;مفكات~Screwdrivers
b|home.tools|ستانلي~Stanley|شنطة عدة~Toolbox;متر~Tape measure;مفك~Screwdriver;كتر~Utility knife
b|home.tools|توتال~Total|شنيور~Drill;عدة~Tool kit
b|home.tools|إنجكو~Ingco|عدة~Tool kit;شنيور~Drill
b|home.furnish|إيكيا~IKEA|رف~Shelf;صندوق تخزين~Storage box;مخدة~Pillow;لحاف~Duvet;ستارة~Curtain;لمبة مكتب~Desk lamp;شماعات~Hangers
b|home.furnish|هوم سنتر~Home Centre|مخدات~Cushions;مفرش سرير~Bedsheets;سجادة~Rug;فوط~Towels
b|home.furnish|ساكو~SACO|أدوات~Tools;تخزين~Storage;مستلزمات حديقة~Garden supplies
b|clothes.mens|إل سي وايكيكي~LC Waikiki|تيشيرت~T-shirt;بنطلون~Trousers;جينز~Jeans;قميص~Shirt;ملابس داخلية~Underwear;بيجامة~Pyjamas
b|clothes.mens|ديفاكتو~DeFacto|تيشيرت~T-shirt;جينز~Jeans;جاكيت~Jacket
b|clothes.mens|ماكس~Max|تيشيرت~T-shirt;بنطلون~Trousers;ملابس أطفال~Kids' clothes
b|clothes.mens|سنتربوينت~Centrepoint|ملابس~Clothing;أحذية~Shoes
b|clothes.mens|زارا~Zara|تيشيرت~T-shirt;قميص~Shirt;جاكيت~Jacket
b|clothes.mens|إتش آند إم~H&M|تيشيرت~T-shirt;جينز~Jeans;ملابس أطفال~Kids' wear
b|clothes.mens|أديداس~Adidas|تيشيرت رياضي~Sports T-shirt;ترينج~Tracksuit;شورت~Shorts
b|clothes.mens|نايك~Nike|تيشيرت رياضي~Sports T-shirt;شورت~Shorts;ترينج~Tracksuit
sa|clothes.mens|الدفة~Al Dafah|ثوب~Thobe;شماغ~Shemagh
eg|clothes.mens|قطونيل~Cottonil|ملابس داخلية~Underwear;فانلة~Vest;شرابات~Socks;بيجامة~Pyjamas
eg|clothes.mens|دايس~Dice|ملابس داخلية~Underwear;فانلة~Vest
eg|clothes.mens|كونكريت~Concrete|قميص~Shirt;بنطلون~Trousers
eg|clothes.mens|تاون تيم~Town Team|تيشيرت~T-shirt;جاكيت~Jacket;بنطلون~Trousers
eg|clothes.mens|أكتيف~Activ|ملابس رياضية~Sportswear;كوتشي~Trainers
b|clothes.shoes|باتا~Bata|حذاء رسمي~Formal shoes;شبشب~Slippers;صندل~Sandals;كوتشي~Trainers
b|clothes.shoes|سكيتشرز~Skechers|كوتشي~Trainers;حذاء مشي~Walking shoes
b|clothes.shoes|أديداس أحذية~Adidas Shoes|كوتشي جري~Running shoes;كوتشي~Trainers;شبشب~Slides
b|clothes.shoes|نايك أحذية~Nike Shoes|كوتشي جري~Running shoes;كوتشي جيم~Training shoes;شبشب~Slides
b|clothes.shoes|كروكس~Crocs|كروكس~Crocs clogs
b|clothes.shoes|بوما~Puma|كوتشي~Trainers
b|gym.gear|أوبتيموم نيوتريشن~Optimum Nutrition|واي بروتين~Whey protein;كرياتين~Creatine;أحماض أمينية~BCAA;جينر~Mass gainer;بروتين بار~Protein bar
b|gym.gear|ماي بروتين~Myprotein|واي بروتين~Whey protein;كرياتين~Creatine;شوفان مطحون~Instant oats
b|gym.gear|ماسل تك~MuscleTech|واي بروتين~Whey protein;كرياتين~Creatine
b|gym.gear|ريبوك~Reebok|دمبلز~Dumbbells;مات~Mat;أستيك~Bands;ستيب~Step
b|gym.gear|ديكاتلون~Decathlon|دمبلز~Dumbbells;كيتل بل~Kettlebell;مات يوجا~Yoga mat;أستيك مقاومة~Resistance bands;عقلة باب~Doorway pull-up bar;حبل نط~Jump rope;شنطة جيم~Gym bag;زجاجة مية~Bottle
b|gym.gear|فيتبيت~Fitbit|ساعة رياضية~Fitness tracker
b|gym.gear|جارمن~Garmin|ساعة جري~Running watch
b|gym.gear|شاومي~Xiaomi|سوار رياضي~Smart band;ميزان ذكي~Smart scale;ساعة~Watch
b|car.carcare|موبيل~Mobil|زيت موتور~Engine oil;زيت 5W-30~5W-30;زيت 10W-40~10W-40
b|car.carcare|شل~Shell|زيت هيليكس~Helix engine oil
b|car.carcare|كاسترول~Castrol|زيت موتور~Engine oil;زيت جير~Gear oil
b|car.carcare|توتال~TotalEnergies|زيت موتور~Engine oil
b|car.carcare|ميشلان~Michelin|كفرات~Tyres
b|car.carcare|بريدجستون~Bridgestone|كفرات~Tyres
b|car.carcare|هانكوك~Hankook|كفرات~Tyres
b|car.carcare|فارتا~Varta|بطارية عربية~Car battery
b|car.carcare|تيرتل واكس~Turtle Wax|شامبو عربيات~Car shampoo;ملمع~Polish;ملمع تابلوه~Dashboard shine
b|car.carcare|بوش قطع غيار~Bosch Parts|مساحات~Wipers;فلتر~Filter;بوجيهات~Spark plugs
sa|car.carcare|بترومين~Petromin|زيت موتور~Engine oil;غيار زيت~Oil change service
b|office.tech|أبل~Apple|آيفون~iPhone;آيباد~iPad;ماك بوك~MacBook;إيربودز~AirPods;شاحن أبل~Apple charger;كابل لايتننج~Lightning cable;ساعة أبل~Apple Watch
b|office.tech|سامسونج إلكترونيات~Samsung Mobile|موبايل جالاكسي~Galaxy phone;تابلت~Tablet;سماعات بادز~Buds;شاحن سامسونج~Samsung charger;ساعة~Watch
b|office.tech|شاومي إلكترونيات~Xiaomi Mobile|موبايل~Phone;سماعات~Earbuds;باور بانك~Power bank
b|office.tech|هواوي~Huawei|موبايل~Phone;ساعة~Watch;سماعات~Earbuds
b|office.tech|لينوفو~Lenovo|لابتوب~Laptop;تابلت~Tablet
b|office.tech|إتش بي~HP|لابتوب~Laptop;طابعة~Printer;حبر طابعة~Ink cartridges;ماوس~Mouse
b|office.tech|ديل~Dell|لابتوب~Laptop;شاشة~Monitor
b|office.tech|كانون~Canon|طابعة~Printer;حبر~Ink;كاميرا~Camera
b|office.tech|إبسون~Epson|طابعة~Printer;حبر~Ink
b|office.tech|لوجيتك~Logitech|ماوس~Mouse;كيبورد~Keyboard;كاميرا ويب~Webcam;سماعة~Headset
b|office.tech|سانديسك~SanDisk|فلاشة~USB drive;كارت ميموري~Memory card;هارد SSD~SSD
b|office.tech|جي بي إل~JBL|سماعة بلوتوث~Bluetooth speaker;سماعات~Headphones
b|office.tech|سوني~Sony|بلايستيشن~PlayStation;سماعات~Headphones;تلفزيون~TV
b|office.stationery|فابر كاستل~Faber-Castell|أقلام رصاص~Pencils;ألوان خشب~Colour pencils;ممحاة~Eraser
b|office.stationery|بيك أدوات~BIC Stationery|أقلام جاف~Ballpoint pens;أقلام رصاص~Pencils;مصحح~Correction pen
b|office.stationery|ستيدلر~Staedtler|أقلام رصاص~Pencils;أقلام تحديد~Markers;مسطرة~Ruler
b|office.stationery|بايلوت~Pilot|أقلام جل~Gel pens;أقلام حبر~Ink pens
b|office.stationery|ميد~Mead|كراسات~Notebooks;دفاتر~Exercise books
b|office.stationery|دبل إيه~Double A|ورق طباعة A4~A4 paper
sa|office.stationery|جرير أدوات~Jarir Stationery|دفاتر~Notebooks;أقلام~Pens;ملفات~Files
eg|office.stationery|سلوى~Salwa|كراسات~Notebooks;كشاكيل~Exercise books
b|other.pets|ويسكاس~Whiskas|أكل قطط ناشف~Dry cat food;أكل قطط مبلول~Wet cat food
b|other.pets|بيديجري~Pedigree|أكل كلاب ناشف~Dry dog food;أكل كلاب مبلول~Wet dog food
b|other.pets|فريسكيز~Friskies|أكل قطط~Cat food
b|other.pets|رويال كانين~Royal Canin|أكل قطط~Cat food;أكل كلاب~Dog food
b|food.fruit|-~-|برتقال أبو سرة~Navel oranges;يوسفي~Mandarins;كلمنتينا~Clementines;جريب فروت~Grapefruit;تفاح أحمر~Red apples;تفاح أخضر~Green apples;تفاح أصفر~Golden apples;كمثرى~Pears;خوخ~Peaches;برقوق~Plums;مشمش~Apricots;كريز~Cherries;عنب أحمر~Red grapes;عنب أبيض~White grapes;عنب بناتي~Seedless grapes;بطيخ~Watermelon;شمام~Cantaloupe;كنتالوب~Honeydew melon;مانجو عويسي~Owais mango;مانجو زبدية~Zebdia mango;مانجو تيمور~Timor mango;جوافة~Guava;رمان~Pomegranate;تين~Figs;تين شوكي~Prickly pear;كاكا~Persimmon;بلح أحمر~Fresh red dates;بلح زغلول~Zaghloul dates;رطب~Rutab;توت أزرق~Blueberries;توت أحمر~Raspberries;توت أسود~Blackberries;أناناس~Pineapple;كيوي~Kiwi;باباي~Papaya;جوز هند~Coconut;موز بلدي~Local bananas;موز مستورد~Imported bananas;فراولة~Strawberries;ليتشي~Lychee;دراجون فروت~Dragon fruit
b|food.veg|-~-|طماطم شيري~Cherry tomatoes;خيار بلدي~Local cucumbers;خس روماني~Romaine lettuce;خس آيسبرج~Iceberg lettuce;كرنب أحمر~Red cabbage;فلفل أحمر~Red peppers;فلفل أصفر~Yellow peppers;فلفل أخضر~Green peppers;بصل أحمر~Red onions;بصل أبيض~White onions;ثوم مقشر~Peeled garlic;باذنجان رومي~Large aubergine;باذنجان عروس~Baby aubergine;كوسة بلدي~Local zucchini;بطاطس للقلي~Frying potatoes;بطاطس صغيرة~Baby potatoes;ذرة مشوي~Corn on the cob;بامية صغيرة~Baby okra;ملوخية خضرا~Fresh molokhia;سلق~Chard;خبيزة~Mallow;رجلة~Purslane;فول أخضر~Fresh fava;حمص أخضر~Green chickpeas;قلقاس~Taro;ليك/كرات أبو شوشة~Leek;شبت وبقدونس~Herbs bundle;زعتر~Thyme;روزماري~Rosemary;فلفل هالبينو~Jalapeño
b|food.meat|-~-|لحم عجل~Veal;لحم ضاني~Mutton;لحم جمل~Camel meat;لحم حاشي~Hashi camel meat;موزات~Shanks;كوارع~Trotters;ريش ضاني~Lamb chops;فخدة ضاني~Leg of lamb;كتف ضاني~Lamb shoulder;لحم مكعبات~Diced meat;لحم مفروم قليل الدهن~Lean mince;ستيك ريب آي~Ribeye;ستيك تندرلوين~Tenderloin;لحم رأس~Head meat;ممبار~Mombar casings;مخ~Brains;كلاوي~Kidneys;طحال~Spleen;لحمة رأس~Head;عكاوي~Oxtail;بفتيك~Escalope;روزبيف~Roast beef
b|food.poultry|-~-|حمام~Pigeons;بط~Duck;وز~Goose;رومي/ديك رومي~Turkey;سمان~Quail;أرانب~Rabbit;فراخ بلدي~Free-range chicken;بيض بلدي~Free-range eggs;بيض أوميجا~Omega eggs;بيض سمان~Quail eggs;صدور ديك رومي مدخنة~Smoked turkey breast
b|food.fish|-~-|سلمون مدخن~Smoked salmon;تونة طازجة~Fresh tuna;ماكريل~Mackerel;أنشوجة~Anchovies;سردين طازج~Fresh sardines;جمبري جامبو~Jumbo prawns;استاكوزا~Lobster;بلح بحر~Mussels;سمك موسى~Sole;هامور~Hamour;شعور~Emperor fish;حريد~Parrotfish;كنعد~Kingfish;بياض~Whitefish;سيباس~Sea bass
b|food.grains|-~-|برغل ناعم~Fine bulgur;برغل خشن~Coarse bulgur;فريكة~Freekeh;كينوا~Quinoa;شعير~Barley;جريش~Jareesh;هريس~Harees wheat;قمح~Wheat;كسكسي~Couscous;نشا~Cornflour;دقيق ذرة~Maize flour;دقيق أرز~Rice flour;دقيق شوفان~Oat flour;خميرة فورية~Instant yeast;بيكنج بودر~Baking powder;بيكربونات~Baking soda;فانيليا~Vanilla;جيلاتين~Gelatine;كاكاو خام~Cocoa powder;رقائق شوفان~Rolled oats;أرز بني~Brown rice;أرز ياسمين~Jasmine rice;أرز سوشي~Sushi rice;مكرونة بالبيض~Egg pasta;رقاق~Roqaq pastry;جلاش~Goulash pastry;كنافة~Kunafa dough;قطايف~Qatayef
b|food.legumes|-~-|عدس أصفر~Yellow lentils;عدس بجبة~Brown lentils;عدس أحمر~Red lentils;فول مدشوش~Split fava;لوبيا~Black-eyed peas;فاصوليا بيضا ناشفة~Dried white beans;حمص ناشف~Dried chickpeas;ترمس~Lupini beans;فول سوداني نيء~Raw peanuts;بسلة ناشفة~Split peas;فول نابت~Sprouted fava
b|food.spices|-~-|بهارات كبسة~Kabsa spice;بهارات مندي~Mandi spice;بهارات برياني~Biryani spice;بهارات شاورما~Shawarma spice;بهارات كفتة~Kofta spice;بهارات سمك~Fish spice;سماق~Sumac;زعتر مطحون~Za'atar;دقة~Dukkah;كمون مطحون~Ground cumin;كزبرة مطحونة~Ground coriander;شطة حمراء~Chili flakes;فلفل أبيض~White pepper;جوزة الطيب~Nutmeg;ورق لورا~Bay leaves;مستكة~Mastic;حبهان~Cardamom pods;زعفران~Saffron;لومي~Dried lime;بزار~Bzar spice;حبة البركة~Black seed;سمسم~Sesame;ملح ليمون~Citric acid;ماء ورد~Rose water;ماء زهر~Orange-blossom water;خل تفاح~Apple cider vinegar;خل أبيض~White vinegar;صويا صوص~Soy sauce;صوص حار~Hot sauce;دبس رمان~Pomegranate molasses;عسل أسود~Molasses;دبس تمر~Date syrup;ورق عنب مخلل~Pickled vine leaves;مخلل مشكل~Mixed pickles;زيتون كلاماتا~Kalamata olives;طحينة~Tahini
b|food.snacks|-~-|بسبوسة~Basbousa;كنافة جاهزة~Ready kunafa;قطايف جاهزة~Ready qatayef;كحك~Kahk;بسكويت العيد~Eid biscuits;غريبة~Ghorayeba;معمول~Maamoul;بقلاوة~Baklava;أم علي~Om Ali;رز بلبن~Rice pudding;مهلبية~Muhallabia;لقيمات~Luqaimat;حلاوة المولد~Mawlid sweets;عسلية~Molasses candy;ملبن~Turkish delight;جيلي~Jelly;كيك جاهز~Ready cake;مارشملو~Marshmallow;لبان~Chewing gum;سكاكر~Candy;لب سوري~Sunflower seeds;لب أبيض~Pumpkin seeds;سوداني محمص~Roasted peanuts;لوز محمص~Roasted almonds;كاجو محمص~Roasted cashews;فستق حلبي~Pistachios;بندق~Hazelnuts;عين جمل~Walnuts;زبيب~Raisins;مشمشية~Dried apricots;تين مجفف~Dried figs;قراصيا~Prunes;توت مجفف~Dried berries;جوز هند مبشور~Desiccated coconut;حمص الشام~Roasted chickpeas;مكسرات مشكلة~Mixed nuts;فشار ميكروويف~Microwave popcorn
b|food.readymeals|-~-|كشري جاهز~Ready koshari;فول وطعمية~Foul & falafel;شاورما~Shawarma sandwich;بروستد~Broasted chicken;مندي~Mandi;كبسة جاهزة~Ready kabsa;مطبق~Mutabbaq;فطير مشلتت~Feteer meshaltet;حواوشي~Hawawshi;كبدة إسكندراني~Alexandrian liver;سمبوسة جاهزة~Ready samosa;ورق عنب جاهز~Ready stuffed vine leaves;محشي جاهز~Ready mahshi;سلطات جاهزة~Ready salads;حمص جاهز~Ready hummus;بابا غنوج~Baba ghanoush;متبل~Mutabbal;تبولة~Tabbouleh;فتوش~Fattoush
b|drinks.hot|-~-|كركديه~Hibiscus;ينسون~Aniseed;قرفة عيدان~Cinnamon sticks;زنجبيل ناشف~Dried ginger;كراوية~Caraway;حلبة~Fenugreek;بابونج~Camomile;شاي أعشاب~Herbal tea;شاي أحمر ناعم~Loose black tea;شاي أخضر صيني~Chinese green tea;قهوة تركي~Turkish coffee;قهوة عربية~Arabic coffee;هيل مطحون للقهوة~Ground cardamom;قهوة سريعة التحضير~Instant coffee;كاكاو ساخن~Hot cocoa;سحلب~Sahlab;مته~Yerba mate;كابتشينو أكياس~Cappuccino sachets
b|drinks.juice|-~-|عصير قصب~Sugarcane juice;سوبيا~Sobia;تمر هندي~Tamarind drink;عرق سوس~Liquorice drink;خروب~Carob drink;جلاب~Jallab;قمر الدين~Amar al-din;عصير ليمون~Lemonade;عصير رمان~Pomegranate juice;عصير جزر~Carrot juice
b|meds.firstaid|-~-|شاش معقم~Sterile gauze;رباط ضاغط~Crepe bandage;قطن طبي~Cotton wool;مقص طبي~Medical scissors;ملقاط~Tweezers;جوانتي طبي~Medical gloves;كمامات~Face masks;كيس ثلج~Ice pack;كيس مية سخنة~Hot-water bottle;علبة إسعافات~First-aid kit;سرنجات~Syringes;محلول ملح~Saline;لاصق جروح كبير~Large dressing;جبيرة~Splint;مرهم مضاد حيوي~Antibiotic ointment
b|meds.devices|-~-|ميزان حمام~Bathroom scale;ميزان مطبخ~Kitchen scale;شريط قياس~Tape measure;جهاز تنفس بخار~Steam inhaler;مرطب جو~Humidifier;وسادة تدفئة~Heating pad;كرسي حمام طبي~Shower chair;عكاز~Walking stick;مشد ظهر~Back brace;رباط ركبة~Knee support;جورب ضاغط~Compression stockings;جهاز تمارين تنفس~Breathing trainer
b|care.bath|-~-|صابون نابلسي~Nabulsi soap;صابون غار~Laurel soap;زيت جوز هند~Coconut oil;زيت أرجان~Argan oil;زيت حبة البركة~Black seed oil;حنة~Henna;سدر~Sidr powder;شاور كاب~Shower cap;مشط~Comb;فرشاة شعر~Hairbrush;توكة~Hair clips;ربطة شعر~Hair ties;ماسك طين~Clay mask;مقشر جسم~Body scrub;صابون سائل~Liquid soap;معقم يدين~Hand sanitiser
b|clean.house|-~-|مساحة زجاج~Squeegee;مقشة~Broom;جاروف~Dustpan;جردل~Bucket;مساحة أرضيات~Floor mop;فوط ميكروفايبر~Microfibre cloths;جوانتي مطبخ~Rubber gloves;فرشاة تواليت~Toilet brush;شفاط حوض~Plunger;مزيل جير~Limescale remover;منظف سجاد~Carpet cleaner;منظف رخام~Marble cleaner;منظف ستانلس~Stainless cleaner;صودا كاوية~Caustic soda;مطهر صنوبر~Pine disinfectant;كلور أقراص~Chlorine tablets;نفتالين~Mothballs;مصيدة فيران~Mouse trap;صاعق ناموس~Bug zapper;بخور للتعطير~Incense
b|home.kitchenware|-~-|طقم سكاكين~Knife set;لوح تقطيع~Chopping board;مبشرة~Grater;مقشرة~Peeler;فتاحة علب~Can opener;مصفاة~Colander;كبة شاي~Tea strainer;براد شاي~Teapot;كنكة~Coffee pot;دلة~Dallah;ترمس~Flask;فناجين قهوة~Coffee cups;كوبايات شاي~Tea glasses;صينية تقديم~Serving tray;طبق تقديم~Serving plate;حلة ضغط~Pressure cooker;طاسة~Frying pan;صينية فرن~Baking tray;قالب كيك~Cake tin;مضرب بيض~Whisk;كيلة/مكيال~Measuring cups;علب بهارات~Spice jars;علب حفظ أكل~Food containers;زمزمية~Water bottle;ترمس أكل~Food flask;شوك وسكاكين~Cutlery;أطباق ورق~Paper plates;أكواب ورق~Paper cups;ملاعق بلاستيك~Plastic spoons;ورق زبدة~Baking paper;ورق ألومنيوم~Aluminium foil;نايلون تغليف~Cling film;أكياس فريزر~Freezer bags;مشابك أكياس~Bag clips
b|home.electric|-~-|مشترك كهربا~Extension lead;فيشة~Plug;لمبة ليد~LED bulb;كشاف شحن~Rechargeable lantern;وصلة~Adapter;حجارة ريموت~Remote batteries;شاحن حجارة~Battery charger;مفتاح كهربا~Light switch;سلك كهربا~Electric cable;شريط لحام~Electrical tape;منظم كهربا~Voltage protector;حساس حركة~Motion sensor light
b|home.tools|-~-|مفك صليبة~Phillips screwdriver;مفك عادة~Flat screwdriver;زرادية~Pliers;شاكوش~Hammer;مفتاح إنجليزي~Adjustable wrench;مسامير~Nails;مسامير قلاووظ~Screws;خوابير~Wall plugs;شريط عزل~Duct tape;سيليكون~Silicone sealant;غرا~Glue;سلم~Ladder;متر قياس~Measuring tape;ميزان مية~Spirit level;منشار~Saw;دهان~Paint;فرشاة دهان~Paintbrush;رول دهان~Paint roller;معجون حوائط~Wall filler;ورق صنفرة~Sandpaper
b|home.furnish|-~-|ملايات~Bedsheets;كفرات مخدات~Pillowcases;بطانية~Blanket;لحاف~Duvet;مخدة~Pillow;مرتبة~Mattress;واقي مرتبة~Mattress protector;فوط حمام~Bath towels;فوط وش~Face towels;برنس~Bathrobe;دواسة حمام~Bath mat;سجادة صلاة~Prayer mat;سجادة~Rug;ستارة~Curtain;شماعات~Hangers;سلة غسيل~Laundry basket;منشر غسيل~Clothes airer;مشابك غسيل~Clothes pegs;مكواة~Iron;طاولة كوي~Ironing board;ساعة حيطة~Wall clock;مراية~Mirror;برواز~Picture frame;شمعة~Candle;مبخرة~Incense burner;فازة~Vase;صندوق تخزين~Storage box;رف~Shelf;جزامة~Shoe rack;كرسي بلاستيك~Plastic chair
b|baby.kids|-~-|لعبة تعليمية~Educational toy;مكعبات~Building blocks;صلصال~Play dough;ألوان مائية~Watercolours;كراسة رسم~Sketchbook;قصص أطفال~Children's books;بازل~Puzzle;كورة~Ball;عجلة أطفال~Kids' bike;سكوتر~Scooter;مايوه أطفال~Kids' swimwear;عوامة~Float;شنطة حضانة~Nursery bag;ملابس أطفال~Kids' clothes;شوز أطفال~Kids' shoes;زي مدرسي~School uniform;مصروف~Pocket money
b|other.gifts|-~-|عطر هدية~Gift perfume;شوكولاتة هدية~Gift chocolates;بوكيه ورد~Bouquet;ساعة هدية~Gift watch;مصحف هدية~Gift Quran;سبحة~Prayer beads;سجادة صلاة هدية~Gift prayer mat;شنطة هدية~Gift bag;كارت هدية~Gift card;تمر هدية~Gift dates;عيدية أطفال~Eidiya;زينة رمضان~Ramadan decorations;فانوس رمضان~Ramadan lantern;زينة العيد~Eid decorations;أضحية~Udhiyah;زكاة الفطر~Zakat al-Fitr;صدقة~Charity
b|other.bills|-~-|تجديد إقامة~Iqama renewal;تجديد رخصة~Licence renewal;تأمين عربية~Car insurance;تأمين طبي~Medical insurance;رسوم مدرسة~School fees;رسوم جامعة~University fees;اشتراك نت منزلي~Home internet;باقة موبايل~Mobile plan;اشتراك نتفليكس~Streaming subscription;اشتراك تخزين سحابي~Cloud storage;صيانة غسالة~Washer repair;سباك~Plumber;كهربائي~Electrician;نقل عفش~Moving service;عاملة منزلية~Housekeeper;تنظيف خزان~Tank cleaning;رش مبيدات~Pest control;غسيل سجاد~Carpet cleaning
b|car.carcare|-~-|فحص دوري~Annual inspection;ترخيص~Registration renewal;غسيل داخلي~Interior cleaning;تظليل~Window tint;مخالفة مرور~Traffic fine;رسوم موقف~Parking fee;رسوم طريق~Road toll;زيت فرامل~Brake fluid;تيل فرامل~Brake pads;بوجيهات~Spark plugs;فلتر بنزين~Fuel filter;فلتر تكييف~Cabin filter;ضبط زوايا~Wheel alignment;ترصيص~Wheel balancing;شاحن عربية~Car charger;حامل موبايل~Phone holder;طفاية حريق~Fire extinguisher;مثلث تحذير~Warning triangle;كابلات اشتراك~Jumper cables;منفاخ كفرات~Tyre inflator
`;
/* turns the data above into catalogue items and merges them into SHOP_ITEMS */
const BRAND_ITEMS = (() => { const out = []; let n = 0;
  BRAND_DATA.trim().split('\n').forEach(line => { const [cc, cs, br, items] = line.split('|'); if (!items) return; const [cat, sub] = cs.split('.'), [bar, ben] = br.split('~'), gen = bar === '-', s = SHOP.find(c => c.k === cat)?.subs.find(x => x.k === sub); if (!s) return;
    items.split(';').forEach(x => { const [ar, en] = x.split('~'); if (!ar) return; const hasA = ar.includes(bar.split(' ')[0]), hasE = (en || '').toLowerCase().includes(ben.split(' ')[0].toLowerCase()); out.push(gen ? {id: 'b.' + (n++), ar, syn: [], en: en || ar, cat, sub, u: s.u, cc} : {id: 'b.' + (n++), ar: hasA ? ar : ar + ' ' + bar, syn: [ar + ' ' + ben], en: hasE ? en : ben + ' ' + (en || ar), cat, sub, u: s.u, br: bar, ben, cc}); }); });
  return out; })();
{ const seen = new Set(SHOP_ITEMS.flatMap(i => [i.ar, ...(i.syn || [])])); BRAND_ITEMS.forEach(i => { if (seen.has(i.ar)) return; seen.add(i.ar); SHOP_ITEMS.push(i); }); }
