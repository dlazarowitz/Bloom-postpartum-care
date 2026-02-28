/**
 * Bloom Content Library
 *
 * Evidence-based educational articles for postpartum parents,
 * organized by category and relevant postpartum week range.
 */

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'recovery' | 'baby_care' | 'mental_health' | 'nutrition' | 'relationships' | 'self_care';
  weekRange: [number, number];
  icon: string;
  readTimeMinutes: number;
}

export const articles: Article[] = [
  {
    id: 'first-48-hours',
    title: 'The First 48 Hours',
    summary: 'What to expect physically and emotionally in the immediate hours after giving birth.',
    content: `The first 48 hours after birth are a whirlwind of emotions and physical sensations. Your body has just accomplished something extraordinary, and now it begins the process of healing. You may feel a mix of elation, exhaustion, and even disbelief. Physically, you can expect cramping as your uterus begins to contract back to its pre-pregnancy size — these "afterpains" can be particularly strong during breastfeeding, as the hormone oxytocin triggers both milk letdown and uterine contractions.

Bleeding (lochia) is completely normal during this time and can be heavier than a typical menstrual period. Use the pads provided by the hospital rather than tampons, and alert your nurse if you soak through more than one pad per hour. If you had a vaginal delivery, the perineal area may be swollen and tender. Ice packs, witch hazel pads, and a peri bottle (squirt bottle for rinsing) will be your best friends. For cesarean births, managing incision pain with prescribed medication on a regular schedule is important — do not wait until pain becomes severe to take your medication.

Emotionally, hormone levels shift dramatically in these first hours. You may experience intense bonding with your baby, or you may feel detached and overwhelmed — both responses are normal. Skin-to-skin contact is encouraged as soon as possible, as it helps regulate your baby's temperature, heart rate, and breathing while also supporting early breastfeeding. Your baby will likely be sleepy but may have alert periods that are ideal for attempting a first latch.

Do not hesitate to ask for help. Your nurses are there to support you with everything from using the bathroom for the first time (which can be nerve-wracking) to positioning your baby for feeding. Accept all the help that is offered and rest whenever your baby sleeps. These early hours set the tone for your recovery, so be gentle with yourself and focus on the basics: hydration, nourishment, rest, and bonding.`,
    category: 'recovery',
    weekRange: [0, 1],
    icon: 'medkit-outline',
    readTimeMinutes: 4,
  },
  {
    id: 'baby-blues-vs-ppd',
    title: 'Understanding Baby Blues vs PPD',
    summary: 'Learn the key differences between normal mood changes and postpartum depression, and when to seek help.',
    content: `Up to 80% of new parents experience what is commonly called the "baby blues" — a period of mood swings, tearfulness, anxiety, and irritability that typically begins two to three days after delivery and resolves on its own within two weeks. Baby blues are driven by the dramatic drop in estrogen and progesterone after birth, combined with sleep deprivation and the overwhelming adjustment to parenthood. You might find yourself crying for no reason, feeling anxious about the baby, or snapping at your partner — and then feeling perfectly fine an hour later.

Postpartum depression (PPD), on the other hand, is a clinical mood disorder that affects approximately 1 in 7 new mothers and can also affect fathers and non-birthing partners. Unlike baby blues, PPD symptoms persist beyond the two-week mark and intensify over time. Key signs include persistent sadness or emptiness, loss of interest in activities you normally enjoy, difficulty bonding with your baby, withdrawal from family and friends, changes in appetite or sleep beyond what is expected with a newborn, overwhelming fatigue, feelings of worthlessness or guilt, difficulty concentrating, and in severe cases, intrusive thoughts about harming yourself or your baby.

The distinction matters because baby blues resolve without treatment, while PPD requires professional support. If your symptoms last longer than two weeks, feel like they are getting worse rather than better, or interfere with your ability to care for yourself or your baby, please reach out to your healthcare provider. PPD is not a sign of weakness or failure — it is a medical condition with highly effective treatments including therapy, support groups, and when appropriate, medication that is safe during breastfeeding.

Screening tools like the Edinburgh Postnatal Depression Scale (EPDS) can help you and your provider assess your symptoms objectively. Many OB practices now routinely screen at the six-week visit, but you do not have to wait. If something feels wrong, trust your instincts and call your provider, a postpartum support hotline (Postpartum Support International: 1-800-944-4773), or go to your nearest emergency room if you are in crisis. Early intervention leads to faster recovery.`,
    category: 'mental_health',
    weekRange: [1, 4],
    icon: 'heart-half-outline',
    readTimeMinutes: 5,
  },
  {
    id: 'breastfeeding-basics',
    title: 'Breastfeeding Basics',
    summary: 'Essential guidance on latching, positions, and navigating common breastfeeding challenges.',
    content: `Breastfeeding is natural, but that does not mean it comes naturally to every parent-baby pair. It is a learned skill for both of you, and it is completely normal to need time, practice, and support. In the first few days, your breasts produce colostrum — a thick, yellowish fluid packed with antibodies and nutrients. Though the volume is small (just a few teaspoons per feeding), it is exactly what your newborn's tiny stomach needs. Your mature milk typically "comes in" between days two and five, at which point your breasts may feel full, firm, and even engorged.

A good latch is the foundation of successful breastfeeding. Signs of a proper latch include: your baby's mouth is opened wide with flanged (turned-out) lips, the chin is pressed into the breast, you can see or hear rhythmic sucking and swallowing, and most importantly, feeding does not cause sharp or persistent pain. Some tenderness in the early days is common, but stabbing pain, cracked nipples, or bleeding are signs that the latch needs adjustment. Try different positions — cradle hold, cross-cradle, football hold, or side-lying — to find what works best for you and your baby. A lactation consultant can be invaluable for troubleshooting positioning.

Common challenges in the first weeks include engorgement (use warm compresses before feeding and cold compresses after), cluster feeding (when baby feeds very frequently for several hours, which is normal and helps build supply), and sore nipples (apply expressed breast milk or medical-grade lanolin after feeds). Watch for signs of mastitis — a red, hot, painful area on the breast accompanied by flu-like symptoms — which requires prompt medical attention.

Know that fed is best. Whether you exclusively breastfeed, supplement with formula, pump exclusively, or use any combination, you are providing for your baby. If breastfeeding is important to you but you are struggling, seek help early. Most hospitals have lactation consultants on staff, and many communities offer breastfeeding support groups. The first six weeks are the most challenging — once you and your baby find your rhythm, it often becomes much easier.`,
    category: 'baby_care',
    weekRange: [0, 2],
    icon: 'nutrition-outline',
    readTimeMinutes: 5,
  },
  {
    id: 'pelvic-floor-recovery',
    title: 'Your Pelvic Floor After Birth',
    summary: 'Understanding pelvic floor changes, gentle exercises, and the healing timeline after delivery.',
    content: `Your pelvic floor — the group of muscles that supports your bladder, uterus, and bowel — undergoes significant strain during pregnancy and delivery. Whether you had a vaginal birth or cesarean, these muscles have been bearing extra weight for months and may be weakened, stretched, or injured. Common postpartum pelvic floor symptoms include urinary leaking when you sneeze, cough, or laugh (stress incontinence), a feeling of heaviness or pressure in the vagina, difficulty controlling gas, and discomfort during intimacy. These symptoms are common, but they are not something you simply have to live with.

In the first two weeks postpartum, focus on rest and gentle awareness rather than active exercise. Practice diaphragmatic breathing: inhale and let your belly and pelvic floor relax and expand, then exhale and gently draw your pelvic floor up. This helps reconnect your brain to these muscles. Avoid heavy lifting (nothing heavier than your baby), straining on the toilet (use a stool under your feet and keep stools soft with adequate hydration and fiber), and high-impact activities.

Around weeks two to four, if your provider agrees, you can begin gentle Kegel exercises. Contract your pelvic floor muscles as if you are stopping the flow of urine, hold for three to five seconds, then release fully. Repeat ten times, three times per day. Quality matters more than quantity — a full release between contractions is just as important as the contraction itself. Avoid doing Kegels on the toilet, as this can actually interfere with normal bladder function. As you progress, you can add longer holds and more repetitions.

If you experience persistent leaking beyond six weeks, pain in the pelvic area, or a feeling of something bulging in the vagina, ask your provider for a referral to a pelvic floor physical therapist. These specialists can assess your specific muscle function using internal examination and biofeedback, and create a tailored rehabilitation program. Pelvic floor PT is highly effective and can resolve symptoms that many people mistakenly assume are just a permanent consequence of childbirth. Your body deserves this care.`,
    category: 'recovery',
    weekRange: [2, 6],
    icon: 'fitness-outline',
    readTimeMinutes: 5,
  },
  {
    id: 'realistic-sleep-tips',
    title: 'Sleep When the Baby Sleeps? Realistic Sleep Tips',
    summary: 'Practical strategies for managing sleep deprivation that go beyond the well-meaning cliche.',
    content: `"Sleep when the baby sleeps" is the most commonly offered advice to new parents — and also one of the most frustrating. When the baby sleeps, there is laundry to fold, food to eat, a shower to take, and maybe just five minutes of quiet to feel like yourself again. While the advice comes from a good place, the reality of newborn sleep deprivation requires more nuanced strategies.

First, understand what you are dealing with: newborns sleep 14 to 17 hours per day, but in stretches of only one to three hours at a time. This means your sleep is fragmented regardless of how many hours you spend in bed. Fragmented sleep is qualitatively different from uninterrupted sleep — even if you add up the total hours, the constant interruptions prevent you from completing full sleep cycles, which is why you may feel exhausted even after being "in bed" for eight hours. This is temporary and will improve, but acknowledging it helps you give yourself grace.

Practical strategies that actually help: If you have a partner, take shifts. One parent covers the 8 PM to 1 AM window while the other sleeps uninterrupted (in a separate room with earplugs if needed), then you switch. Even one four-to-five-hour block of uninterrupted sleep can be transformative. If you are breastfeeding, the off-duty parent can bring the baby to you for feeds and handle everything else — burping, diaper changes, settling back to sleep. If you are bottle feeding or pumping, the off-duty parent can handle entire feeds. Accept help from family and friends specifically for nighttime or early morning so you can sleep.

Create a sleep-friendly environment for yourself: keep the room cool and dark, avoid screens for 30 minutes before your sleep window, and consider a white noise machine to mask household sounds. When you do nap during the day, keep it to 20 to 30 minutes to avoid sleep inertia (that groggy feeling from waking mid-cycle). Prioritize sleep over housework — genuinely. A messy house will not harm your health, but chronic sleep deprivation can contribute to postpartum mood disorders, impaired judgment, and delayed physical recovery. Give yourself permission to rest.`,
    category: 'self_care',
    weekRange: [0, 4],
    icon: 'moon-outline',
    readTimeMinutes: 5,
  },
  {
    id: 'nutrition-recovery-milk-supply',
    title: 'Nutrition for Recovery and Milk Supply',
    summary: 'What to eat to support your body\'s healing and sustain energy during the postpartum period.',
    content: `Your body needs significant nutritional support during the postpartum period — you are healing from birth, potentially producing breast milk, operating on minimal sleep, and managing the physical demands of caring for a newborn. This is not the time for restrictive dieting. Your caloric needs are actually higher now than they were during pregnancy, particularly if you are breastfeeding, which requires an additional 300 to 500 calories per day.

Focus on nutrient-dense foods that support healing: protein is critical for tissue repair and recovery — aim for lean meats, eggs, beans, lentils, Greek yogurt, and nuts at every meal. Iron-rich foods help replenish what was lost during delivery — red meat, spinach, fortified cereals, and lentils paired with vitamin C sources (citrus, bell peppers) for better absorption. Omega-3 fatty acids support brain health for both you and your baby — find them in salmon, sardines, walnuts, and flaxseeds. Calcium remains important for bone health, especially during breastfeeding — dairy products, fortified plant milks, leafy greens, and tofu are excellent sources.

For milk supply specifically, the most important factors are adequate calorie intake, hydration, and frequent breast stimulation (nursing or pumping). While certain foods like oats, brewer's yeast, flaxseed, and fenugreek are traditionally considered galactagogues (milk-boosting foods), the scientific evidence is limited. They certainly will not hurt, and many parents swear by lactation cookies and oatmeal. Staying well-hydrated is essential — keep a water bottle at every nursing station and aim for at least 80 ounces of fluid per day. Your urine should be pale yellow.

Meal prep and planning can feel impossible with a newborn. Accept meals from friends and family whenever offered, stock your freezer with one-handed foods you can eat while feeding the baby (wraps, muffins, energy balls, cut fruit), and consider a postpartum meal delivery service if it fits your budget. Keep shelf-stable snacks everywhere — trail mix by the nursing chair, granola bars in the diaper bag, cheese sticks in the fridge. Perfect nutrition is not the goal; consistent fueling is. Eat regularly, drink constantly, and take your prenatal vitamin (yes, you should continue it postpartum, especially while breastfeeding).`,
    category: 'nutrition',
    weekRange: [0, 8],
    icon: 'leaf-outline',
    readTimeMinutes: 5,
  },
  {
    id: 'when-to-call-doctor',
    title: 'When to Call Your Doctor',
    summary: 'Warning signs and symptoms that require prompt medical attention in the postpartum period.',
    content: `While most postpartum recovery proceeds smoothly, certain symptoms require urgent medical attention. Knowing what to watch for can help you act quickly when it matters. This is not meant to cause anxiety — the vast majority of new parents will not experience these complications — but being informed is empowering.

Call your provider immediately or go to the emergency room if you experience: a fever of 100.4 degrees Fahrenheit (38 degrees Celsius) or higher, which could indicate infection of the uterus, incision, or breast; heavy bleeding that soaks through a pad in an hour or includes large clots (bigger than a golf ball); foul-smelling vaginal discharge, which may signal uterine infection (endometritis); severe headache that does not improve with medication, visual changes, or upper abdominal pain, which could indicate postpartum preeclampsia (this can develop up to six weeks after delivery, even if your blood pressure was normal during pregnancy); chest pain, difficulty breathing, or a rapid heartbeat; redness, warmth, swelling, or discharge from a cesarean incision or episiotomy site; pain, redness, or swelling in one leg, which could indicate a deep vein thrombosis (blood clot).

For mental health emergencies, seek immediate help if you experience: thoughts of harming yourself or your baby, hallucinations or paranoid thoughts, confusion or disorientation, or extreme agitation. Postpartum psychosis is rare (affecting 1-2 per 1,000 deliveries) but is a psychiatric emergency that requires immediate treatment. Do not leave the person alone — call 911 or go to the nearest emergency room.

Less urgent but still important reasons to contact your provider include: painful urination or inability to urinate, breast lumps accompanied by redness and fever (possible mastitis), persistent pain that is not improving or is getting worse, mood symptoms lasting beyond two weeks (possible postpartum depression or anxiety), and difficulty with basic daily functioning. Trust your instincts — if something feels wrong, it is always appropriate to call. Your provider would rather hear from you for a false alarm than have you delay care for a genuine complication. Many practices have a nurse line available 24/7 for postpartum concerns.`,
    category: 'recovery',
    weekRange: [0, 6],
    icon: 'alert-circle-outline',
    readTimeMinutes: 5,
  },
  {
    id: 'relationship-changes-after-baby',
    title: 'Relationship Changes After Baby',
    summary: 'Navigating the shift in your partnership and maintaining connection during a transformative time.',
    content: `A baby changes everything about your relationship — and that is not necessarily a bad thing, though it rarely feels easy. Research consistently shows that relationship satisfaction dips in the first year after a baby arrives, even for couples who were deeply happy before. Understanding why this happens and knowing it is normal can help you navigate this period without assuming something is fundamentally wrong with your partnership.

The main stressors are predictable: sleep deprivation makes everyone irritable and less patient. The division of household and baby-care labor often feels uneven, even when both partners are trying hard. Physical intimacy takes a back seat due to exhaustion, hormonal changes, healing, and being "touched out" from constant contact with the baby. The mental load — the invisible work of tracking feeding schedules, doctor appointments, diaper inventory, and developmental milestones — often falls disproportionately on one parent and breeds resentment. And your identities are shifting: you are no longer just partners; you are parents, and figuring out what that means takes time.

Communication is the single most important tool you have. Schedule brief daily check-ins, even just five minutes while the baby sleeps, to share how you are feeling — not about logistics, but about emotions. Use "I" statements rather than "you" statements: "I feel overwhelmed when I handle bedtime alone" lands very differently than "You never help with bedtime." Express appreciation deliberately and frequently — a simple "Thank you for doing that feeding" or "I noticed you cleaned the kitchen and I appreciate it" reinforces partnership rather than scorekeeping. Discuss expectations explicitly: who handles night feeds, who gets a morning to sleep in, when each person gets alone time.

Be patient with physical intimacy. Most providers recommend waiting at least six weeks before intercourse, but emotional and physical readiness varies widely. Communicate openly about desires, fears, and physical changes. Intimacy does not have to mean sex — holding hands, cuddling on the couch, a long hug, or a genuine compliment can maintain connection. If conflicts feel unresolvable or resentment is building, consider couples therapy. A therapist experienced with the perinatal period can provide tools specific to this life transition. Investing in your relationship now is investing in your family.`,
    category: 'relationships',
    weekRange: [2, 8],
    icon: 'people-outline',
    readTimeMinutes: 5,
  },
  {
    id: 'six-week-checkup',
    title: 'The 6-Week Checkup: What to Expect',
    summary: 'Preparing for your postpartum follow-up appointment and questions to bring along.',
    content: `The six-week postpartum checkup is a milestone in your recovery — it is your provider's opportunity to assess how your body is healing and your chance to address any concerns that have come up since delivery. Understanding what to expect can help you make the most of this appointment, which often feels rushed given everything there is to cover.

Your provider will typically perform a physical examination that includes checking your weight and blood pressure, examining your abdomen and uterus (which should have contracted back close to its pre-pregnancy size by now), and inspecting any incision sites or tears for proper healing. If you had a cesarean, they will check the incision line for signs of infection or separation. If you had a vaginal delivery with tearing or episiotomy, they will assess the repair. A pelvic exam may be performed to evaluate your cervix and pelvic floor muscle tone. If you are due for a Pap smear, it may be done at this visit.

Your provider should also screen for postpartum depression and anxiety — many practices use a standardized questionnaire like the Edinburgh Postnatal Depression Scale. Be honest in your responses; this is not a test you can fail, and accurate answers lead to appropriate support. This is also the visit where you will discuss contraception options, as fertility can return before your first postpartum period, sometimes as early as three weeks after delivery. Options safe for breastfeeding include progestin-only pills, IUDs, implants, and barrier methods.

Come prepared with a list of questions and concerns. Common topics include: when it is safe to resume exercise, sexual activity, and driving (if you had a cesarean); persistent pain or discomfort; breastfeeding difficulties; urinary or fecal incontinence; mood changes; and hair loss (which typically peaks around three to four months postpartum and is normal). Do not save everything for this one visit — if you have urgent concerns before the six-week mark, call your provider. And if you leave the appointment feeling like something was not addressed, call back or schedule a follow-up. Your postpartum health deserves thorough attention.`,
    category: 'recovery',
    weekRange: [5, 7],
    icon: 'clipboard-outline',
    readTimeMinutes: 5,
  },
  {
    id: 'introducing-tummy-time',
    title: 'Introducing Tummy Time',
    summary: 'How to start tummy time safely, handle fussiness, and support your baby\'s motor development.',
    content: `Tummy time — placing your baby on their stomach while they are awake and supervised — is one of the most important activities for your baby's physical development. It strengthens the neck, shoulder, arm, and core muscles that your baby will need for every major motor milestone: holding their head up, rolling over, sitting, crawling, and eventually walking. The American Academy of Pediatrics recommends starting tummy time from day one, beginning with short sessions of two to three minutes, two to three times per day.

Many babies protest tummy time, especially in the early weeks. This is normal — being on their stomach is hard work for undeveloped muscles, and the position is unfamiliar. Start by placing your baby on your chest while you recline at an angle; this counts as tummy time and allows your baby to see your face, which is motivating. You can also try placing them across your lap, or on a firm surface with a rolled towel under their chest for slight elevation. Get down on the floor at their eye level, talk to them, sing, or place a small mirror in front of them. Keep sessions short and positive — two to three minutes is plenty for a newborn. End the session before your baby becomes truly upset.

Gradually increase the duration as your baby's strength improves. By one month, aim for about ten minutes total per day spread across multiple sessions. By three months, most babies can tolerate longer stretches and may even begin to enjoy it as they gain the strength to lift and turn their head. Watch for developmental progress: in the first month, your baby may briefly lift their head and turn it side to side. By two months, they may push up on their forearms. By three to four months, many babies can push up on extended arms and may begin reaching for toys placed nearby.

Safety is paramount: always supervise tummy time (never leave a baby unattended on their stomach), always place your baby on a firm, flat surface, and never do tummy time on soft surfaces like beds, couches, or pillows where suffocation is a risk. Tummy time should only happen when your baby is fully awake and alert, not drowsy. If your baby falls asleep during tummy time, gently turn them onto their back. Wait at least 30 minutes after feeding to avoid spit-up discomfort. If your baby has a medical condition affecting their movement, consult your pediatrician for modified tummy time guidance.`,
    category: 'baby_care',
    weekRange: [2, 6],
    icon: 'happy-outline',
    readTimeMinutes: 5,
  },
  {
    id: 'managing-visitors-boundaries',
    title: 'Managing Visitors and Boundaries',
    summary: 'How to set healthy limits with family and friends while protecting your recovery and bonding time.',
    content: `Everyone wants to meet the new baby, and their excitement comes from a place of love. But in the early postpartum weeks, a steady stream of visitors can interfere with your recovery, disrupt feeding routines, exhaust you further, and leave you feeling like a host rather than a new parent who needs rest. Setting boundaries is not selfish — it is an act of care for yourself, your baby, and your new family unit.

Start before the baby arrives by communicating expectations with close family and friends. Let people know that you will reach out when you are ready for visitors rather than expecting a revolving door. Designate your partner or a trusted family member as the gatekeeper who fields requests and manages scheduling. Consider creating a simple message you can send: "We are so excited to introduce the baby when we are settled. We will let you know when we are ready for short visits — probably in [timeframe]. In the meantime, the best way to help is [meal delivery, groceries, dog walking]." Giving people a concrete way to help redirects the energy from visiting to supporting.

When visitors do come, set clear parameters. Keep visits short — 30 minutes to an hour is plenty in the early weeks. Ask visitors to text when they arrive rather than ring the doorbell (which may wake a sleeping baby). Request that anyone with cold symptoms, coughs, or recent illness reschedule. Have hand sanitizer at the door and do not feel embarrassed asking people to wash their hands before holding the baby. It is completely acceptable to limit who holds the baby, to feed the baby during the visit without apology, and to end the visit when you are tired. A simple "We are going to wind down now, but it was so good to see you" is sufficient.

It is especially important to protect yourself from visitors who are critical, give unsolicited advice, or make you feel judged. You may need to be particularly direct with family members who have strong opinions about how you should feed, sleep train, or parent. A useful phrase: "We appreciate the input, but we are following our pediatrician's guidance on this." You do not owe anyone an explanation or debate. This is your baby, your recovery, and your family. Anyone who truly cares about you will respect your boundaries, even if they are initially disappointed. And if they do not, that says more about them than about you.`,
    category: 'self_care',
    weekRange: [0, 4],
    icon: 'shield-outline',
    readTimeMinutes: 5,
  },
  {
    id: 'returning-to-exercise',
    title: 'Returning to Exercise Safely',
    summary: 'Guidelines for resuming physical activity after childbirth, from gentle movement to higher intensity.',
    content: `Returning to exercise after childbirth requires patience and a gradual approach. Your body has undergone profound changes over nine months of pregnancy and the physical demands of labor and delivery. Rushing back to pre-pregnancy workouts risks injury, pelvic floor dysfunction, and setbacks in your recovery. The timeline varies based on your delivery type, fitness level before and during pregnancy, and individual healing — there is no universal "six-week clearance" despite what social media might suggest.

For the first six weeks, focus on gentle, restorative movement. Walking is the gold standard starting exercise — begin with short, slow walks around your home or neighborhood, gradually increasing distance and pace as you feel able. Practice the pelvic floor and core reconnection exercises discussed in your recovery plan: diaphragmatic breathing, gentle Kegels, and pelvic tilts. These foundational exercises help heal diastasis recti (abdominal separation, which occurs in up to two-thirds of pregnancies) and rebuild core stability from the inside out. Avoid crunches, sit-ups, planks, and heavy lifting, which can worsen abdominal separation.

After your six-week checkup (and clearance from your provider), you can begin to reintroduce more structured exercise — but start at a lower intensity than where you left off. A good rule of thumb is to begin at 50% of your pre-pregnancy intensity and volume, then increase by no more than 10% per week. Low-impact activities like swimming, cycling, yoga (postnatal-specific classes are ideal), and strength training with lighter weights are excellent starting points. Pay attention to warning signs that you are doing too much: increased bleeding, pelvic pressure or heaviness, urine leaking during exercise, or pain in the abdomen, pelvis, or joints.

If you are breastfeeding, exercise is safe and does not negatively affect milk supply or composition, provided you stay hydrated and maintain adequate calorie intake. Wear a supportive sports bra and consider nursing or pumping before exercise for comfort. High-impact activities like running and jumping should generally wait until at least three months postpartum — your pelvic floor needs time to rebuild the strength to handle those forces. Consider working with a postnatal fitness specialist or pelvic floor physical therapist who can assess your readiness and create a personalized return-to-exercise plan. Your body grew a human being; rebuilding it deserves the same thoughtfulness and time.`,
    category: 'recovery',
    weekRange: [6, 12],
    icon: 'walk-outline',
    readTimeMinutes: 5,
  },
];
