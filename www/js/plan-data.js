/* ميزان — the training and food plan */
'use strict';
/* ---------- exercise figures: side-view athlete, pose A → B → A ---------- */
const ST = {head: [100, 28], sh: [100, 42], hip: [100, 80], kn: [101, 104], ft: [101, 128]};
const SE = {head: [93, 38], sh: [92, 52], hip: [90, 92], kn: [118, 92], ft: [120, 124]};
const SEAT = [['rect', 66, 94, 44, 6], ['line', 88, 100, 88, 128]], BACK = [['rect', 74, 46, 8, 48]], MAT = [['rect', 20, 124, 160, 4]];
const EX = {
  lat_pulldown: {ar: 'سحب عالي', en: 'Lat Pulldown', eq: ['جهاز كابل', 'Cable machine'], mus: ['الضهر والباي', 'Back & biceps'], w: 1,
    tip: ['اسحب البار لأعلى صدرك، وكتافك لتحت ولورا. متشدّش برقبتك ولا ترجع بضهرك.', 'Pull the bar to your upper chest, shoulders down and back. No neck pulling, no leaning back.'],
    f: {eq: [...SEAT, ['rect', 112, 80, 16, 6]], A: {...SE, el: [100, 32], ha: [102, 12]}, B: {el: [108, 70], ha: [104, 50]}, att: [{t: 'cable', at: 'ha', from: [103, -10]}, {t: 'bar', at: 'ha', w: 54}]}},
  chest_press: {ar: 'ضغط صدر بالجهاز', en: 'Machine Chest Press', eq: ['جهاز', 'Machine'], mus: ['الصدر والتراي', 'Chest & triceps'], w: 1,
    tip: ['ضهرك لازق في المسند، وادفع لقدام من غير ما تقفل كوعك خالص.', 'Back flat on the pad, push forward without fully locking the elbows.'],
    f: {eq: [...SEAT, ...BACK], A: {...SE, el: [80, 72], ha: [104, 64]}, B: {el: [112, 62], ha: [134, 60]}, att: [{t: 'handle', at: 'ha'}]}},
  cable_row: {ar: 'سحب أرضي بالكابل', en: 'Seated Cable Row', eq: ['جهاز كابل', 'Cable machine'], mus: ['وسط الضهر', 'Mid back'], w: 1,
    tip: ['ضهرك مفرود، اسحب بكوعك لورا واضغط لوحي الكتف ثانية.', 'Tall spine, drive elbows back and squeeze the shoulder blades for a second.'],
    f: {eq: [['rect', 56, 102, 52, 6], ['line', 138, 90, 138, 118]], A: {head: [83, 46], sh: [82, 60], hip: [80, 100], kn: [110, 90], ft: [132, 104], el: [104, 68], ha: [126, 72]}, B: {el: [66, 78], ha: [88, 74], sh: [78, 60], head: [77, 46]}, att: [{t: 'cable', at: 'ha', from: [150, 104]}, {t: 'handle', at: 'ha'}]}},
  db_shoulder_press: {ar: 'ضغط كتف بالدمبل', en: 'Seated DB Shoulder Press', eq: ['دمبل', 'Dumbbells'], mus: ['الكتف', 'Shoulders'], w: 1,
    tip: ['ضهرك لازق في الكرسي، وانزل بالدمبل لحد مستوى ودنك بس.', 'Back against the bench, lower the dumbbells to ear level only.'],
    f: {eq: [...SEAT, ...BACK], A: {...SE, el: [104, 66], ha: [102, 46]}, B: {el: [98, 32], ha: [97, 12]}, att: [{t: 'db', at: 'ha'}]}},
  db_curl: {ar: 'باي بالدمبل', en: 'Dumbbell Curl', eq: ['دمبل', 'Dumbbells'], mus: ['الباي', 'Biceps'], w: 1,
    tip: ['كوعك ثابت جنبك ومن غير مرجحة. انزل ببطء.', 'Elbows fixed at your sides, no swinging. Lower slowly.'],
    f: {A: {...ST, el: [102, 62], ha: [104, 82]}, B: {ha: [114, 46]}, att: [{t: 'db', at: 'ha'}]}},
  tri_pushdown: {ar: 'تراي بالكابل', en: 'Triceps Pushdown', eq: ['جهاز كابل', 'Cable machine'], mus: ['التراي', 'Triceps'], w: 1,
    tip: ['كوعك لازق جنبك، والحركة من الكوع بس.', 'Elbows pinned to your sides, move only at the elbow.'],
    f: {A: {...ST, sh: [102, 42], head: [104, 28], el: [106, 62], ha: [122, 48]}, B: {ha: [112, 82]}, att: [{t: 'cable', at: 'ha', from: [136, -10]}, {t: 'bar', at: 'ha', w: 18}]}},
  leg_press: {ar: 'دفع رجل', en: 'Leg Press', eq: ['جهاز', 'Machine'], mus: ['الفخذ والأرداف', 'Quads & glutes'], w: 1,
    tip: ['ركبتك في اتجاه صوابع رجلك، ومتقفلش ركبتك خالص فوق.', 'Knees track over the toes; don’t lock out at the top.'],
    f: {eq: [['line', 46, 54, 84, 104, 'thick'], ['rect', 40, 106, 60, 6]], A: {head: [54, 50], sh: [60, 62], hip: [80, 100], el: [70, 82], ha: [82, 96], kn: [100, 70], ft: [120, 90]}, B: {kn: [122, 84], ft: [150, 90]}, att: [{t: 'vpad', at: 'ft'}]}},
  db_rdl: {ar: 'رفعة رومانية بالدمبل', en: 'Dumbbell Romanian Deadlift', eq: ['دمبل', 'Dumbbells'], mus: ['الخلفية والأرداف', 'Hamstrings & glutes'], w: 1,
    tip: ['ضهرك مفرود طول الوقت، والحركة من الوسط لورا، والركبة مثنية سنة.', 'Flat back throughout, hinge at the hips, soft knees.'],
    f: {A: {...ST, hip: [98, 80], el: [100, 62], ha: [100, 82]}, B: {head: [138, 54], sh: [124, 58], hip: [90, 80], kn: [98, 104], el: [124, 80], ha: [124, 100]}, att: [{t: 'db', at: 'ha'}]}},
  lying_leg_curl: {ar: 'رجل خلفي نايم', en: 'Lying Leg Curl', eq: ['جهاز', 'Machine'], mus: ['الخلفية', 'Hamstrings'], w: 1,
    tip: ['حوضك لازق في الجهاز، اطلع بسرعة وانزل ببطء.', 'Hips pressed down, curl up fast and lower slowly.'],
    f: {eq: [['rect', 36, 96, 118, 6], ['line', 60, 102, 60, 128], ['line', 130, 102, 130, 128]], A: {head: [44, 84], sh: [58, 90], hip: [100, 90], kn: [132, 90], ft: [162, 90], el: [50, 100], ha: [40, 100]}, B: {ft: [142, 62]}, att: [{t: 'pad', at: 'ft'}]}},
  leg_extension: {ar: 'رجل أمامي', en: 'Leg Extension', eq: ['جهاز', 'Machine'], mus: ['الفخذ الأمامي', 'Quads'], w: 1,
    tip: ['وزن خفيف وحركة نظيفة، ووقفة ثانية فوق.', 'Light weight, clean reps, pause one second at the top.'],
    f: {eq: [...SEAT, ...BACK], A: {...SE, el: [94, 74], ha: [100, 94], ft: [116, 124]}, B: {ft: [148, 96]}, att: [{t: 'pad', at: 'ft'}]}},
  calf_raise: {ar: 'سمانة واقف', en: 'Standing Calf Raise', eq: ['دمبل أو جهاز', 'Dumbbell or machine'], mus: ['السمانة', 'Calves'], w: 1,
    tip: ['اطلع على أطراف صوابعك ووقفة ثانية، وانزل للآخر.', 'Rise onto your toes, pause, then lower all the way.'],
    f: {A: {...ST, el: [100, 62], ha: [100, 82], ft: [100, 126]}, B: {head: [100, 20], sh: [100, 34], hip: [100, 72], kn: [101, 96], ft: [101, 118], el: [100, 54], ha: [100, 74]}, att: [{t: 'toe', at: 'ft', to: [116, 128]}, {t: 'db', at: 'ha'}]}},
  dead_bug: {ar: 'تمرين الحشرة', en: 'Dead Bug', eq: ['أرضي', 'Floor'], mus: ['البطن العميقة', 'Deep core'], w: 0,
    tip: ['ضهرك لازق في الأرض. افرد إيد ورجل عكس بعض ببطء.', 'Lower back glued to the floor; extend opposite arm and leg slowly.'],
    f: {eq: MAT, A: {head: [40, 112], sh: [56, 116], hip: [100, 116], el: [58, 96], ha: [60, 76], kn: [104, 94], ft: [124, 96]}, B: {el: [40, 104], ha: [22, 108], kn: [126, 108], ft: [152, 114]}}},
  incline_walk: {ar: 'مشي بميل', en: 'Incline Treadmill Walk', eq: ['مشاية', 'Treadmill'], mus: ['كارديو', 'Cardio'], w: 0,
    tip: ['ميل 6–10% وسرعة تقدر تتكلم فيها. متمسكش في المشاية.', '6–10% incline at a talking pace. Don’t hold the rails.'],
    f: {eq: [['line', 46, 126, 162, 110, 'thick'], ['line', 152, 111, 148, 60], ['line', 148, 60, 128, 58]], A: {head: [104, 26], sh: [104, 40], hip: [104, 78], el: [98, 60], ha: [104, 76], kn: [114, 100], ft: [120, 118]}, B: {el: [112, 58], ha: [120, 70], kn: [100, 102], ft: [92, 122]}}},
  outdoor_walk: {ar: 'مشي برا الجيم', en: 'Brisk Walking', eq: ['من غير أدوات', 'No equipment'], mus: ['كارديو خفيف', 'Light cardio'], w: 0,
    tip: ['مشي سريع مريح بعد العصر.', 'A comfortable brisk walk after Asr.'],
    f: {A: {head: [104, 26], sh: [104, 40], hip: [104, 78], el: [98, 60], ha: [104, 76], kn: [114, 102], ft: [120, 126]}, B: {el: [112, 58], ha: [120, 70], kn: [98, 104], ft: [90, 126]}}},
  bird_dog: {ar: 'بيرد دوج', en: 'Bird Dog', eq: ['أرضي', 'Floor'], mus: ['الضهر والبطن', 'Back & core'], w: 0,
    tip: ['افرد إيد ورجل عكس بعض في خط واحد، والحوض ثابت.', 'Reach opposite arm and leg into one line, hips square.'],
    f: {eq: MAT, A: {head: [56, 88], sh: [70, 96], hip: [120, 96], el: [70, 112], ha: [70, 124], kn: [120, 124], ft: [146, 124]}, B: {el: [52, 92], ha: [32, 90], kn: [144, 94], ft: [168, 92]}}},
  side_plank: {ar: 'بلانك جانبي', en: 'Side Plank', eq: ['أرضي', 'Floor'], mus: ['جوانب البطن', 'Obliques'], w: 0,
    tip: ['جسمك خط مستقيم من الراس للرجل، ومتنزلش بالحوض.', 'Straight line from head to feet; don’t let the hips sag.'],
    f: {eq: MAT, A: {head: [50, 96], sh: [62, 104], el: [62, 122], ha: [82, 122], hip: [110, 116], kn: [136, 120], ft: [162, 122]}, B: {hip: [110, 104], kn: [136, 114]}}},
  glute_bridge: {ar: 'رفع الحوض من الأرض', en: 'Glute Bridge', eq: ['أرضي', 'Floor'], mus: ['الأرداف', 'Glutes'], w: 0,
    tip: ['اضغط بكعبك وارفع حوضك لحد ما جسمك يبقى خط مستقيم.', 'Drive through the heels until your body forms a straight line.'],
    f: {eq: MAT, A: {head: [40, 114], sh: [56, 118], el: [74, 120], ha: [92, 122], hip: [96, 120], kn: [120, 100], ft: [132, 124]}, B: {hip: [100, 98]}}},
  incline_db_press: {ar: 'ضغط صدر مائل بالدمبل', en: 'Incline Dumbbell Press', eq: ['دمبل + بنش', 'Dumbbells + bench'], mus: ['أعلى الصدر', 'Upper chest'], w: 1,
    tip: ['ميل البنش حوالي 30 درجة، وانزل لحد جنب صدرك.', 'Bench at about 30°, lower to the sides of your chest.'],
    f: {eq: [['line', 64, 44, 96, 104, 'thick'], ['rect', 90, 102, 40, 6], ['line', 100, 108, 100, 128]], A: {head: [72, 50], sh: [78, 64], hip: [98, 100], kn: [124, 100], ft: [126, 126], el: [86, 88], ha: [96, 68]}, B: {el: [96, 50], ha: [104, 30]}, att: [{t: 'db', at: 'ha'}]}},
  assisted_pullup: {ar: 'عقلة بمساعدة الجهاز', en: 'Assisted Pull-up', eq: ['جهاز مساعدة', 'Assist machine'], mus: ['الضهر العريض', 'Lats'], w: 1,
    tip: ['الرقم هنا وزن المساعدة، وكل ما يقل تبقى أقوى.', 'The number is the assistance. Less assistance means you got stronger.'],
    f: {eq: [['line', 60, 10, 140, 10, 'thick'], ['line', 140, 10, 140, 128]], A: {head: [104, 30], sh: [100, 42], el: [99, 26], ha: [100, 10], hip: [100, 80], kn: [104, 100], ft: [84, 104]}, B: {head: [104, 4], sh: [100, 20], el: [112, 20], hip: [100, 58], kn: [104, 78], ft: [84, 82]}, att: [{t: 'pad', at: 'kn'}]}},
  chest_supported_row: {ar: 'تجديف بسند صدر', en: 'Chest-Supported Row', eq: ['دمبل + بنش', 'Dumbbells + bench'], mus: ['وسط الضهر', 'Mid back'], w: 1,
    tip: ['صدرك لازق في المسند، واسحب بكوعك لورا.', 'Chest on the pad, row with your elbows.'],
    f: {eq: [['line', 64, 114, 122, 70, 'thick'], ['line', 80, 108, 80, 128]], A: {head: [124, 60], sh: [112, 72], hip: [76, 102], kn: [80, 118], ft: [70, 128], el: [114, 92], ha: [114, 112]}, B: {el: [94, 80], ha: [104, 96]}, att: [{t: 'db', at: 'ha'}]}},
  lateral_raise: {ar: 'رفرفة جانبي', en: 'Lateral Raise', eq: ['دمبل', 'Dumbbells'], mus: ['جانب الكتف', 'Side delts'], w: 1,
    tip: ['وزن خفيف، كوعك مثني شوية، واطلع لمستوى كتفك بس.', 'Light weight, soft elbows, raise to shoulder height only.'],
    f: {A: {head: [100, 26], sh: [88, 42], sh2: [112, 42], hip: [93, 80], hip2: [107, 80], kn: [92, 104], ft: [92, 128], kn2: [108, 104], ft2: [108, 128], el: [84, 62], ha: [84, 82], el2: [116, 62], ha2: [116, 82]}, B: {el: [68, 46], ha: [50, 44], el2: [132, 46], ha2: [150, 44]}, att: [{t: 'db', at: 'ha'}, {t: 'db', at: 'ha2'}]}},
  face_pull: {ar: 'فيس بول', en: 'Cable Face Pull', eq: ['جهاز كابل', 'Cable machine'], mus: ['خلفي الكتف', 'Rear delts'], w: 1,
    tip: ['اسحب الحبل لمستوى وشك وافتح إيديك لبره.', 'Pull the rope to your face and spread your hands apart.'],
    f: {eq: [['line', 172, 0, 172, 128]], A: {...ST, el: [118, 46], ha: [138, 40]}, B: {el: [86, 40], ha: [106, 32]}, att: [{t: 'cable', at: 'ha', from: [172, 38]}, {t: 'handle', at: 'ha'}]}},
  hammer_curl: {ar: 'باي هامر', en: 'Hammer Curl', eq: ['دمبل', 'Dumbbells'], mus: ['الباي والساعد', 'Biceps & forearms'], w: 1,
    tip: ['مسكة الدمبل زي الشاكوش، وكوعك ثابت.', 'Neutral (hammer) grip, elbows still.'],
    f: {A: {...ST, el: [102, 62], ha: [104, 82]}, B: {ha: [114, 46]}, att: [{t: 'db', at: 'ha', v: 1}]}},
  overhead_triceps: {ar: 'تراي فوق الراس', en: 'Overhead Triceps Extension', eq: ['دمبل', 'Dumbbell'], mus: ['التراي', 'Triceps'], w: 1,
    tip: ['كوعك ثابت جنب راسك، والحركة من الكوع بس.', 'Elbows stay by your head; move only at the elbow.'],
    f: {A: {...ST, el: [106, 20], ha: [90, 32]}, B: {ha: [108, -2]}, att: [{t: 'db', at: 'ha'}]}},
  goblet_squat: {ar: 'سكوات بالدمبل', en: 'Goblet Squat', eq: ['دمبل', 'Dumbbell'], mus: ['الفخذ والأرداف', 'Quads & glutes'], w: 1,
    tip: ['الدمبل عند صدرك، انزل وضهرك مفرود وكعبك على الأرض.', 'Dumbbell at your chest, squat with a tall back and heels down.'],
    f: {A: {...ST, el: [108, 58], ha: [104, 46]}, B: {head: [104, 52], sh: [100, 64], hip: [86, 98], kn: [114, 100], ft: [104, 128], el: [112, 80], ha: [108, 68]}, att: [{t: 'db', at: 'ha', v: 1}]}},
  hip_thrust: {ar: 'رفع الحوض على بنش', en: 'Hip Thrust', eq: ['بار أو جهاز', 'Barbell or machine'], mus: ['الأرداف', 'Glutes'], w: 1,
    tip: ['كتفك على البنش، واضغط الأرداف فوق ثانية، ودقنك لتحت.', 'Shoulders on the bench, squeeze the glutes at the top, chin tucked.'],
    f: {eq: [['rect', 34, 96, 40, 32]], A: {head: [60, 88], sh: [72, 94], el: [82, 108], ha: [96, 112], hip: [100, 120], kn: [128, 102], ft: [138, 128]}, B: {ha: [100, 90], hip: [104, 92], kn: [132, 96]}, att: [{t: 'plate', at: 'hip'}]}},
  split_squat: {ar: 'طعنات ثابتة', en: 'Split Squat', eq: ['دمبل', 'Dumbbells'], mus: ['الفخذ والأرداف', 'Quads & glutes'], w: 1,
    tip: ['انزل لتحت مش لقدام، وامسك في حاجة للتوازن أول أسابيع.', 'Drop straight down, not forward. Hold something for balance at first.'],
    f: {A: {head: [98, 26], sh: [98, 40], hip: [96, 78], kn: [118, 102], ft: [130, 128], kn2: [80, 102], ft2: [64, 126], el: [98, 60], ha: [98, 78]}, B: {head: [96, 46], sh: [96, 60], hip: [94, 98], kn: [124, 104], kn2: [86, 124], el: [96, 80], ha: [96, 98]}, att: [{t: 'db', at: 'ha'}]}},
  seated_leg_curl: {ar: 'رجل خلفي قاعد', en: 'Seated Leg Curl', eq: ['جهاز', 'Machine'], mus: ['الخلفية', 'Hamstrings'], w: 1,
    tip: ['ثبّت المسند على فخذك، واسحب لتحت ببطء.', 'Lock the thigh pad down and curl slowly.'],
    f: {eq: [...SEAT, ...BACK, ['rect', 112, 80, 18, 6]], A: {...SE, el: [94, 74], ha: [100, 94], ft: [148, 96]}, B: {ft: [116, 124]}, att: [{t: 'pad', at: 'ft'}]}},
  back_extension: {ar: 'ظهر سفلي', en: 'Back Extension', eq: ['جهاز', 'Machine'], mus: ['أسفل الضهر', 'Lower back'], w: 0,
    tip: ['اطلع لحد ما جسمك يبقى خط مستقيم، من غير ما ترجع لورا زيادة.', 'Rise to a straight line, no over-arching.'],
    f: {eq: [['rect', 94, 88, 14, 8], ['line', 100, 96, 120, 128], ['rect', 146, 120, 14, 6]], A: {head: [66, 122], sh: [76, 112], el: [82, 104], ha: [90, 98], hip: [100, 86], kn: [128, 104], ft: [150, 118]}, B: {head: [58, 68], sh: [70, 76], el: [78, 84], ha: [88, 80]}}},
  seated_calf: {ar: 'سمانة قاعد', en: 'Seated Calf Raise', eq: ['جهاز', 'Machine'], mus: ['السمانة', 'Calves'], w: 1,
    tip: ['اطلع للآخر وانزل للآخر ببطء.', 'Full range, slow lowering.'],
    f: {eq: SEAT, A: {...SE, el: [100, 78], ha: [112, 88], ft: [122, 124]}, B: {kn: [118, 86], ft: [122, 118], ha: [112, 82], el: [100, 74]}, att: [{t: 'toe', at: 'ft', to: [136, 124]}, {t: 'pad', at: 'kn'}]}}
};
let PROG = {
  6: {t: {ar: 'جزء علوي A', en: 'Upper body A'}, k: 'strength', ex: [['lat_pulldown', 3, '10–12', 90], ['chest_press', 3, '10–12', 90], ['cable_row', 3, '10–12', 90], ['db_shoulder_press', 3, '10–12', 75], ['db_curl', 2, '12', 60], ['tri_pushdown', 2, '12', 60]]},
  0: {t: {ar: 'جزء سفلي A', en: 'Lower body A'}, k: 'strength', ex: [['leg_press', 3, '10–12', 90], ['db_rdl', 3, '10', 90], ['lying_leg_curl', 3, '12', 60], ['leg_extension', 2, '12–15', 60], ['calf_raise', 3, '15', 45], ['dead_bug', 3, {ar: '10 لكل جنب', en: '10 per side'}, 45]]},
  1: {t: {ar: 'كارديو وبطن', en: 'Cardio & core'}, k: 'cardio', ex: [['incline_walk', 1, {ar: '40 دقيقة', en: '40 min'}, 0], ['bird_dog', 3, {ar: '10 لكل جنب', en: '10 per side'}, 45], ['side_plank', 3, {ar: '20 ثانية لكل جنب', en: '20 s per side'}, 45], ['glute_bridge', 3, '15', 45]]},
  2: {t: {ar: 'جزء علوي B', en: 'Upper body B'}, k: 'strength', ex: [['incline_db_press', 3, '10–12', 90], ['assisted_pullup', 3, '8–10', 90], ['chest_supported_row', 3, '10–12', 75], ['lateral_raise', 3, '12–15', 60], ['face_pull', 2, '15', 60], ['hammer_curl', 2, '12', 60], ['overhead_triceps', 2, '12', 60]]},
  3: {t: {ar: 'جزء سفلي B', en: 'Lower body B'}, k: 'strength', ex: [['goblet_squat', 3, '10–12', 90], ['hip_thrust', 3, '10–12', 90], ['split_squat', 2, {ar: '10 لكل رجل', en: '10 per leg'}, 75], ['seated_leg_curl', 3, '12', 60], ['back_extension', 2, '12', 60], ['seated_calf', 3, '15', 45]]},
  4: {t: {ar: 'مشي خفيف', en: 'Easy walk'}, k: 'walk', ex: [['outdoor_walk', 1, {ar: '45 دقيقة', en: '45 min'}, 0]]},
  5: {t: {ar: 'راحة كاملة', en: 'Full rest'}, k: 'rest', ex: []}
};
let GYM = [6, 0, 1, 2, 3];
function weekNo(iso){ const s = S.profile?.start || iso; return Math.max(1, Math.floor(daysBetween(s, iso) / 7) + 1); }
function phaseOf(w){ const c = ((w - 1) % 12) + 1;
  if (c <= 2) return {c, n: L('تعلّم الحركة', 'Learn the movements'), d: L('اختار وزن تقدر تعمل بيه 3–4 عدات زيادة عن المطلوب. التركيز على الأداء الصح.', 'Pick a weight you could do 3–4 more reps with. Focus on clean technique.')};
  if (c <= 8) return {c, n: L('التدرج في الأوزان', 'Progressive overload'), d: L('لما تكمّل أعلى عدد عدات في كل المجموعات، زوّد الوزن 2.5–5% المرة الجاية.', 'When you hit the top of the rep range on every set, add 2.5–5% next time.')};
  if (c <= 11) return {c, n: L('زيادة الحجم', 'Volume block'), d: L('مجموعة رابعة في أول تمرينين كل يوم أوزان.', 'A fourth set on the first two exercises of every strength day.')};
  return {c, n: L('أسبوع تخفيف', 'Deload week'), d: L('نفس التمارين بنص المجموعات علشان الجسم يرتاح.', 'Same exercises at half the sets so your body recovers.')};
}
function pregnant(){ return S.settings.edition === 'women' && S.women?.mode === 'pregnant'; }
function planFor(iso){
  const dow = D(iso).getDay(), p = PROG[dow], w = weekNo(iso), ph = phaseOf(w);
  const ex = p.ex.map(([id, sets, reps, rest], i) => { let s = sets; if (p.k === 'strength') { if (ph.c >= 9 && ph.c <= 11 && i < 2) s = sets + 1; if (ph.c === 12) s = Math.max(1, Math.ceil(sets / 2)); } return {id, sets: s, reps: LX(reps), rest}; });
  return {...p, title: LX(p.t), dow, ex, week: w, ph};
}

/* ---------- meals ---------- */
// ingredient: [ar, en, amount, unit, kind]  kind: p protein, c carb, v veg, f fat, x other
const U = {g: ['جم', 'g'], graw: ['جم نيء', 'g raw'], ml: ['مل', 'ml'], pc: ['', ''], can: ['علبة', 'can'], tsp: ['معلقة صغيرة', 'tsp'], tbsp: ['معلقة كبيرة', 'tbsp'], cup: ['كوباية', 'cup'], txt: ['', '']};
const I = (ar, en, n, u, k) => [ar, en, n, u, k];
const ingAmt = x => { if (x[3] === 'txt') { const s = String(x[2] || ''); return s.includes('|') ? (LANG === 'en' ? s.split('|')[1] : s.split('|')[0]) : s; } const u = LANG === 'en' ? U[x[3]][1] : U[x[3]][0]; return (fmt(x[2], 1) + ' ' + u).trim(); };
const ingName = x => LANG === 'en' ? x[1] : x[0];
