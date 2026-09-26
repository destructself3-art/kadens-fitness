# Kadens — batch prompts

4 self-contained texts, one per pass. Paste a whole block into a chat-based image model (in one chat, in order).
Generated from `docs/shot-list.json` by `scripts/build-batch-prompts.mjs`.

## Pass 1

```text
PASS 1 OF 4: the club: hero, pulse check, zones and six studios (15 images, shots 01 to 15)

STYLE BIBLE (applies to every image)
This is one continuous evening photoshoot for "Kadens", a large three-storey fitness club in Kazan where every workout is planned around the member's heart rate. The club's name never appears in any image. Every image shows the same club:
- a black rubber floor made of compressed crumb with fine grey and scarlet flecks
- raw board-formed concrete walls, blackened steel, black acoustic baffles on the ceiling
- thin scarlet-red LED lines: the club's signature light
- matte-black, unbranded equipment; black bumper plates with no markings
- smoked oak only in the calm zones (yoga and pilates studios, spa, locker room)
- members wear black, graphite or white sportswear; coaches wear black with a thin scarlet stripe on the sleeve

LIGHT MODES (every shot names its mode)
PULSE: low-key and dramatic. The main light comes from scarlet-red linear LED lines behind and above the scene; it carves glowing red rim-light edges along bodies and equipment, and a thin atmospheric haze turns it into visible beams. Everything else falls into deep near-black shadow, with a faint cool-grey fill so shapes stay readable. Palette: near-black asphalt, graphite, scarlet red (#FF3A24) and chalk-white highlights.
STEEL: clean, cool neutral-white top light from long linear ceiling fixtures falls evenly on matte-black equipment and a black rubber floor; a thin scarlet-red LED strip along the base of the walls and the edges of the lifting platforms is the only accent colour; the far corners of the room fall off into shadow. Palette: matte black, graphite, raw concrete grey, chalk white and one thin line of scarlet red.
CALM: soft, warm and dim, like the last minutes of a sunset; low amber light washes across the floor from slots near the floor line, leaving long gentle shadows and no harsh contrast; a faint deep-red glow far in the background ties it to the rest of the club. Palette: warm graphite, smoked oak, sand, dim amber and a whisper of deep red.
WATER: the pool hall is dark; the water glows from within, lit by underwater lights in cool aqua-white that throw moving caustic patterns onto the walls and ceiling; the pool edge carries a thin scarlet-red accent line that reflects in the water. Palette: black, deep teal, aqua-white and one scarlet accent.
RIM: a studio portrait on a seamless near-black backdrop with a light haze. A single strong rim light from directly behind the subject outlines the whole silhouette in the colour given for the shot; a very faint cool fill from the front keeps the body a deep, almost black silhouette with no facial features visible. The backdrop, camera distance and light setup are identical across the whole coach series; only the rim colour changes. Palette: near-black backdrop, deep shadow and the colour given for the shot along the edges.
STREET: blue hour sliding into night; a light rain has just stopped and the wet asphalt mirrors every light; warm street lamps, a cool deep-blue sky and the scarlet glow of the club's windows. Palette: deep blue dusk, black, warm sodium-orange street light and scarlet red.

Photo style: Premium editorial sports photography for a large modern fitness club, shot on a full-frame camera with fast prime lenses. Cinematic and gritty, true-to-life skin and material textures with visible sweat and chalk, crisp highlights, deep but not crushed blacks, subtle fine film grain. Photorealistic.
People: adults of different ages, genders and body types, shown only as silhouettes, from behind or cropped. Never a visible face.
Never: text, lettering, numbers or weight markings, logos or brand marks, readable screens, watermarks, visible faces, children, collages or grids.

HOW TO WORK
1. Generate every shot below as a separate photorealistic image, in the listed order, at the listed aspect ratio and the highest resolution you can.
2. Right before each image, write its file name on its own line (for example: hero.jpg).
3. One image per shot. Do not combine shots into a grid or collage.
4. A shot marked TWIN must reuse the image of the shot it names as its base: keep the same camera angle, framing and subject and change only what the shot describes. If that image is not in this chat, ask me to attach it.
5. Coach portraits are one series: the same backdrop, camera distance, figure scale and light for every coach. Only the pose and the rim colour change.
6. If you can only make a few images per reply, stop after them and wait. When I write "continue", resume from the next number.

SHOTS

[01] hero.jpg | 16:9 | PULSE light
A cinematic wide shot inside a dark training studio at night. On the right third of the frame an athlete stands on a black rubber floor right after an all-out interval, seen from behind in a three-quarter back view: hands on hips, head lowered, shoulders and back glistening with sweat, ribcage heaving. Fine haze hangs in the air and catches beams of scarlet light from a vertical LED line behind the athlete, so the whole body is outlined by a glowing red rim. The left two thirds of the frame stay almost empty: dark haze, soft shadow and a faint red glow, clean negative space for a very large headline.
People only as silhouettes, from behind or with faces turned away into shadow.

[02] pulse-check.jpg | 4:5 | PULSE light
An extreme close-up of the side of a neck just below the jawline: the index and middle fingers of one hand press gently against the carotid artery to count the pulse. The frame is cropped at the chin so that no face is visible. The skin glistens with fine sweat after training; a scarlet rim light from behind traces the line of the neck, the edge of the jaw and the fingers; the background is dark haze. Shallow depth of field, fingertips in razor-sharp focus, generous dark space above the hand.
Only parts of the body in the frame, cropped so that no face is visible.

[03] zone-gym-floor.jpg | 16:9 | STEEL light
A wide, slightly elevated view across a large gym floor at night: rows of matte-black power racks with lifting platforms, a long dumbbell rack, cable stations and benches, all unbranded, on a black rubber floor with fine flecks. Raw concrete columns, black acoustic baffles overhead. Two or three members train in the middle distance, seen from behind and small in the frame. At the far end, floor-to-ceiling windows show the blurred lights of the night city. Orderly and real, a space that is ready to use.
People only as silhouettes, from behind or with faces turned away into shadow.

[04] zone-functional.jpg | 3:2 | STEEL light
A functional training zone at night, seen from a low three-quarter angle along a long strip of dark-grey artificial turf with two black weight sleds on it. Along the wall runs a matte-black pull-up rig with climbing ropes hanging from the ceiling; black kettlebells stand in neat rows on the floor, black plyo boxes are stacked in a corner, medicine balls rest on a steel rack. Black rubber floor with fine flecks, raw concrete wall, a strong sense of depth.
No people in this shot.

[05] zone-cardio.jpg | 3:2 | STEEL light
A cardio zone at night: a long row of matte-black treadmills and air bikes faces floor-to-ceiling windows; beyond the glass the lights of a night city spread out in soft bokeh under a deep-blue sky. Two runners on the treadmills are seen from behind as dark silhouettes against the window. The treadmill consoles are dark and blank. A thin scarlet LED line runs along the window sill and reflects in the glass.
People only as silhouettes, from behind or with faces turned away into shadow.

[06] zone-pool.jpg | 3:2 | WATER light
A 25-metre indoor swimming pool at night with six lanes, seen from one end at a low angle so the lanes run into the distance. The water is perfectly still and glows from underwater lights; black lane ropes with scarlet end segments; soft caustic light ripples across a dark concrete ceiling. The hall is otherwise dark, calm and empty.
No people in this shot.

[07] zone-spa.jpg | 3:2 | CALM light
A quiet spa zone: on the left, a cedar-lined sauna behind a glass door glowing warm amber; in the foreground, a small round cold-plunge pool of dark still water with a thin wisp of steam, set into a floor of dark basalt stone. A folded black towel with a thin scarlet stripe lies on a smoked-oak bench. Warm, intimate, silent.
No people in this shot.

[08] zone-lobby.jpg | 3:2 | STEEL light
The entrance lobby of the club at night: a long monolithic reception desk of raw concrete, a row of black glass turnstiles and low black lounge chairs on a polished dark concrete floor. A single scarlet LED line runs along the ceiling from the entrance deep into the club; right above the reception desk it jumps into one sharp spike, like a single beat on a cardiogram, then continues flat. The floor mirrors the red line. No signage.
No people in this shot.

[09] facade-night.jpg | 16:9 | STREET light
The exterior of a modern three-storey fitness club on an empty city street in Kazan at night, just after rain. A clean, dark building of black-stained concrete with large floor-to-ceiling windows; on the second floor the cycling studio glows scarlet red and small silhouettes of riders are visible through the glass; the ground-floor lobby glows warm. The wet asphalt in the foreground mirrors the red windows. No signage or lettering on the building.
People only as silhouettes, from behind or with faces turned away into shadow.

[10] studio-cycle.jpg | 3:2 | PULSE light
An empty cycling studio before class: about thirty matte-black studio bikes arranged in curved, stepped tiers like a small amphitheatre, all facing a low instructor podium with a single bike on it. Behind the podium a wall of vertical scarlet LED lines glows through light haze. Black acoustic ceiling, black rubber floor. The room waits in red darkness, dramatic and focused. View from the top back tier toward the podium.
No people in this shot.

[11] studio-ring.jpg | 3:2 | PULSE light
An empty combat-sports hall: a full-size boxing ring with black ropes and a dark canvas floor in the centre, lit from above by a square of scarlet light; a row of black leather heavy bags hangs on chains along the side wall, one of them still slightly swinging. Raw concrete walls, light haze. Low angle from a corner of the ring.
No people in this shot.

[12] studio-forge.jpg | 3:2 | PULSE light
An empty high-intensity studio set up for a circuit class: stations of black rowing machines, battle ropes laid out on the floor, kettlebells, slam balls and plyo boxes arranged in a neat loop on a black rubber floor. Scarlet LED lines on the walls, light haze, one overhead spotlight making a pool of light in the centre. The moment right before the timer starts.
No people in this shot.

[13] studio-dance.jpg | 3:2 | PULSE light
An empty dance and group-fitness studio: a dark sprung wooden floor, a full-height mirror wall on one side doubling the space, black step platforms stacked neatly by the wall, and a ceiling rig of small spotlights washing the floor in scarlet with a few beams of warm white through light haze. Wide view from a corner; no camera or photographer reflected in the mirror.
No people in this shot.

[14] studio-yoga.jpg | 3:2 | CALM light
An empty yoga studio at dusk: a warm smoked-oak floor, black yoga mats rolled up and lined along one wall with cork blocks beside them, soft amber light washing low across the floor from slots near the floor line, a large window with a sheer linen curtain glowing faintly. Minimal, silent, warm. Wide view from a low height.
No people in this shot.

[15] studio-reformer.jpg | 3:2 | CALM light
An empty pilates studio with eight reformer machines of black steel and smoked oak with dark upholstered carriages, arranged in two neat rows on a pale polished concrete floor. Soft warm light from low slots, long gentle shadows, a tall window at the end of the room. Calm, precise, premium. Three-quarter view down the rows.
No people in this shot.

When all 15 images of this pass are done, write: PASS 1 DONE.
```

## Pass 2

```text
PASS 2 OF 4: class covers for the schedule (14 images, shots 16 to 29)

STYLE BIBLE (applies to every image)
This is one continuous evening photoshoot for "Kadens", a large three-storey fitness club in Kazan where every workout is planned around the member's heart rate. The club's name never appears in any image. Every image shows the same club:
- a black rubber floor made of compressed crumb with fine grey and scarlet flecks
- raw board-formed concrete walls, blackened steel, black acoustic baffles on the ceiling
- thin scarlet-red LED lines: the club's signature light
- matte-black, unbranded equipment; black bumper plates with no markings
- smoked oak only in the calm zones (yoga and pilates studios, spa, locker room)
- members wear black, graphite or white sportswear; coaches wear black with a thin scarlet stripe on the sleeve

LIGHT MODES (every shot names its mode)
PULSE: low-key and dramatic. The main light comes from scarlet-red linear LED lines behind and above the scene; it carves glowing red rim-light edges along bodies and equipment, and a thin atmospheric haze turns it into visible beams. Everything else falls into deep near-black shadow, with a faint cool-grey fill so shapes stay readable. Palette: near-black asphalt, graphite, scarlet red (#FF3A24) and chalk-white highlights.
STEEL: clean, cool neutral-white top light from long linear ceiling fixtures falls evenly on matte-black equipment and a black rubber floor; a thin scarlet-red LED strip along the base of the walls and the edges of the lifting platforms is the only accent colour; the far corners of the room fall off into shadow. Palette: matte black, graphite, raw concrete grey, chalk white and one thin line of scarlet red.
CALM: soft, warm and dim, like the last minutes of a sunset; low amber light washes across the floor from slots near the floor line, leaving long gentle shadows and no harsh contrast; a faint deep-red glow far in the background ties it to the rest of the club. Palette: warm graphite, smoked oak, sand, dim amber and a whisper of deep red.
WATER: the pool hall is dark; the water glows from within, lit by underwater lights in cool aqua-white that throw moving caustic patterns onto the walls and ceiling; the pool edge carries a thin scarlet-red accent line that reflects in the water. Palette: black, deep teal, aqua-white and one scarlet accent.
RIM: a studio portrait on a seamless near-black backdrop with a light haze. A single strong rim light from directly behind the subject outlines the whole silhouette in the colour given for the shot; a very faint cool fill from the front keeps the body a deep, almost black silhouette with no facial features visible. The backdrop, camera distance and light setup are identical across the whole coach series; only the rim colour changes. Palette: near-black backdrop, deep shadow and the colour given for the shot along the edges.
STREET: blue hour sliding into night; a light rain has just stopped and the wet asphalt mirrors every light; warm street lamps, a cool deep-blue sky and the scarlet glow of the club's windows. Palette: deep blue dusk, black, warm sodium-orange street light and scarlet red.

Photo style: Premium editorial sports photography for a large modern fitness club, shot on a full-frame camera with fast prime lenses. Cinematic and gritty, true-to-life skin and material textures with visible sweat and chalk, crisp highlights, deep but not crushed blacks, subtle fine film grain. Photorealistic.
People: adults of different ages, genders and body types, shown only as silhouettes, from behind or cropped. Never a visible face.
Never: text, lettering, numbers or weight markings, logos or brand marks, readable screens, watermarks, visible faces, children, collages or grids.

HOW TO WORK
1. Generate every shot below as a separate photorealistic image, in the listed order, at the listed aspect ratio and the highest resolution you can.
2. Right before each image, write its file name on its own line (for example: hero.jpg).
3. One image per shot. Do not combine shots into a grid or collage.
4. A shot marked TWIN must reuse the image of the shot it names as its base: keep the same camera angle, framing and subject and change only what the shot describes. If that image is not in this chat, ask me to attach it.
5. Coach portraits are one series: the same backdrop, camera distance, figure scale and light for every coach. Only the pose and the rim colour change.
6. If you can only make a few images per reply, stop after them and wait. When I write "continue", resume from the next number.

SHOTS

[16] class-cycle.jpg | 3:2 | PULSE light
A cycling class at full sprint, seen from the back row of the studio: riders out of the saddle on matte-black bikes, silhouetted against a wall of scarlet LED lines, bodies leaning forward, sweat flying; haze turns the red light into beams. Slight motion blur on the legs, the nearest rider sharp.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
People only as silhouettes, from behind or with faces turned away into shadow.

[17] class-boxing.jpg | 3:2 | PULSE light
A frozen moment of a boxing pad drill: a black glove slams into a coach's black focus mitt and throws off a burst of sweat droplets that glow in scarlet rim light. Only gloves, forearms and shoulders are in the frame. Dark hazy background, very fast shutter, every droplet crisp.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
Only parts of the body in the frame, cropped so that no face is visible.

[18] class-hiit.jpg | 3:2 | PULSE light
A HIIT class at maximum effort: an athlete seen from behind whips two heavy battle ropes into tall waves; a cloud of chalk dust hangs in the air and glows in scarlet backlight; the ropes are caught mid-wave with slight motion blur, the athlete's back and arms tense. Other members are dark silhouettes in the haze beyond.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
People only as silhouettes, from behind or with faces turned away into shadow.

[19] class-functional.jpg | 3:2 | STEEL light
A functional training class: three members in a row swing black kettlebells to chest height in perfect sync, seen from a low angle slightly behind them, the kettlebells frozen at the top of the swing. Turf strip underfoot, a pull-up rig behind, a thin scarlet LED line on the wall; faces turned away or lost in shadow.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
People only as silhouettes, from behind or with faces turned away into shadow.

[20] class-dance.jpg | 3:2 | PULSE light
A dance-fitness class in motion: a group of silhouetted dancers mid-move, arms thrown up, hair flying, bodies softly blurred by motion against beams of scarlet and warm-white light in haze. Energetic, joyful, rhythmic. Shot from the back of the room at dancer height.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
People only as silhouettes, from behind or with faces turned away into shadow.

[21] class-yoga.jpg | 3:2 | CALM light
A yoga class at dusk: a woman in warrior II seen from behind on a black mat, arms extended, silhouetted against the soft glow of a linen-curtained window; two other practitioners out of focus in the background. Warm amber light across the oak floor, calm and quiet.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
People only as silhouettes, from behind or with faces turned away into shadow.

[22] class-stretching.jpg | 3:2 | CALM light
A stretching class: a person sits in a deep seated forward fold on a black mat, head dropped toward the knees so the face is hidden, a long shadow stretching across the warm oak floor; soft amber side light outlines the curve of the back. Minimal composition with plenty of empty floor around.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
People only as silhouettes, from behind or with faces turned away into shadow.

[23] class-reformer.jpg | 3:2 | CALM light
A close, low side view of a pilates reformer in use: a person's legs press the footbar with bare feet flexed, the carriage gliding out on its rails, the springs taut. Only legs and hips in the frame. Black steel and smoked oak, soft warm light, precise and controlled.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
Only parts of the body in the frame, cropped so that no face is visible.

[24] class-aqua.jpg | 3:2 | WATER light
An underwater view of an aqua-fitness class: the legs of several people jogging and kicking in the water, clouds of silver bubbles and beams of light from the surface, a lane rope visible above. Only legs and hands in the frame. Cool aqua glow, dynamic and playful.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
Only parts of the body in the frame, cropped so that no face is visible.

[25] class-swim.jpg | 3:2 | WATER light
A swimmer's arm and shoulder mid freestyle stroke, shot right at water level: the hand slicing into glowing water, a crisp arc of splash frozen in the air, the head turned down into the water under a black swim cap so no face is visible. Dark hall, underwater light, an out-of-focus scarlet lane-rope segment in the foreground.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
Only parts of the body in the frame, cropped so that no face is visible.

[26] class-strength.jpg | 3:2 | STEEL light
A strength session: an athlete seen from behind in a power rack at the bottom of a heavy barbell back squat, black unmarked bumper plates on the bar, a faint cloud of chalk in the cool top light, the scarlet LED strip along the edge of the platform. Powerful, focused, grounded.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
People only as silhouettes, from behind or with faces turned away into shadow.

[27] class-run.jpg | 3:2 | STEEL light
A low close-up of a runner's legs and shoes mid-stride on a treadmill belt: strong motion blur on the belt and the trailing foot, the leading shoe sharp. Beyond, a floor-to-ceiling window with the blurred lights of the night city. Only legs in the frame.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
Only parts of the body in the frame, cropped so that no face is visible.

[28] class-row.jpg | 3:2 | PULSE light
A low side view of an athlete on a black rowing machine at the catch: knees bent, arms extended, hands gripping the handle; the chain and fan housing sharp in the foreground, sweat glistening on the forearms. Cropped at the shoulders so no face is visible. Scarlet rim light and haze.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
Only parts of the body in the frame, cropped so that no face is visible.

[29] class-trx.jpg | 3:2 | STEEL light
Suspension training: a member leans back into a row on black suspension straps anchored to a steel rig, the body one straight diagonal line, seen from behind at an angle against a scarlet-lit wall so the figure reads as a clean silhouette. More straps hang empty in a row beside. Graphic, minimal composition.
Keep the main action inside the central square of the frame so it survives a 1:1 crop.
People only as silhouettes, from behind or with faces turned away into shadow.

When all 14 images of this pass are done, write: PASS 2 DONE.
```

## Pass 3

```text
PASS 3 OF 4: coach portraits, one series (12 images, shots 30 to 41)

STYLE BIBLE (applies to every image)
This is one continuous evening photoshoot for "Kadens", a large three-storey fitness club in Kazan where every workout is planned around the member's heart rate. The club's name never appears in any image. Every image shows the same club:
- a black rubber floor made of compressed crumb with fine grey and scarlet flecks
- raw board-formed concrete walls, blackened steel, black acoustic baffles on the ceiling
- thin scarlet-red LED lines: the club's signature light
- matte-black, unbranded equipment; black bumper plates with no markings
- smoked oak only in the calm zones (yoga and pilates studios, spa, locker room)
- members wear black, graphite or white sportswear; coaches wear black with a thin scarlet stripe on the sleeve

LIGHT MODES (every shot names its mode)
PULSE: low-key and dramatic. The main light comes from scarlet-red linear LED lines behind and above the scene; it carves glowing red rim-light edges along bodies and equipment, and a thin atmospheric haze turns it into visible beams. Everything else falls into deep near-black shadow, with a faint cool-grey fill so shapes stay readable. Palette: near-black asphalt, graphite, scarlet red (#FF3A24) and chalk-white highlights.
STEEL: clean, cool neutral-white top light from long linear ceiling fixtures falls evenly on matte-black equipment and a black rubber floor; a thin scarlet-red LED strip along the base of the walls and the edges of the lifting platforms is the only accent colour; the far corners of the room fall off into shadow. Palette: matte black, graphite, raw concrete grey, chalk white and one thin line of scarlet red.
CALM: soft, warm and dim, like the last minutes of a sunset; low amber light washes across the floor from slots near the floor line, leaving long gentle shadows and no harsh contrast; a faint deep-red glow far in the background ties it to the rest of the club. Palette: warm graphite, smoked oak, sand, dim amber and a whisper of deep red.
WATER: the pool hall is dark; the water glows from within, lit by underwater lights in cool aqua-white that throw moving caustic patterns onto the walls and ceiling; the pool edge carries a thin scarlet-red accent line that reflects in the water. Palette: black, deep teal, aqua-white and one scarlet accent.
RIM: a studio portrait on a seamless near-black backdrop with a light haze. A single strong rim light from directly behind the subject outlines the whole silhouette in the colour given for the shot; a very faint cool fill from the front keeps the body a deep, almost black silhouette with no facial features visible. The backdrop, camera distance and light setup are identical across the whole coach series; only the rim colour changes. Palette: near-black backdrop, deep shadow and the colour given for the shot along the edges.
STREET: blue hour sliding into night; a light rain has just stopped and the wet asphalt mirrors every light; warm street lamps, a cool deep-blue sky and the scarlet glow of the club's windows. Palette: deep blue dusk, black, warm sodium-orange street light and scarlet red.

Photo style: Premium editorial sports photography for a large modern fitness club, shot on a full-frame camera with fast prime lenses. Cinematic and gritty, true-to-life skin and material textures with visible sweat and chalk, crisp highlights, deep but not crushed blacks, subtle fine film grain. Photorealistic.
People: adults of different ages, genders and body types, shown only as silhouettes, from behind or cropped. Never a visible face.
Never: text, lettering, numbers or weight markings, logos or brand marks, readable screens, watermarks, visible faces, children, collages or grids.

HOW TO WORK
1. Generate every shot below as a separate photorealistic image, in the listed order, at the listed aspect ratio and the highest resolution you can.
2. Right before each image, write its file name on its own line (for example: hero.jpg).
3. One image per shot. Do not combine shots into a grid or collage.
4. A shot marked TWIN must reuse the image of the shot it names as its base: keep the same camera angle, framing and subject and change only what the shot describes. If that image is not in this chat, ask me to attach it.
5. Coach portraits are one series: the same backdrop, camera distance, figure scale and light for every coach. Only the pose and the rim colour change.
6. If you can only make a few images per reply, stop after them and wait. When I write "continue", resume from the next number.

SHOTS

[30] coach-boxing.jpg | 3:4 | RIM light, scarlet red (Z4)
A studio portrait of a boxing coach, a man in his thirties with a compact muscular build, standing in a boxing guard with black gloves raised, shoulders rolled forward, chin tucked; the hand wraps and loose training shorts are outlined by the light.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

[31] coach-cycle.jpg | 3:4 | RIM light, vivid orange (Z3)
A studio portrait of a cycling instructor, a lean woman in her late twenties, standing beside a matte-black studio bike with one hand on the handlebar and a small towel over her shoulder, her head turned toward the bike.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

[32] coach-strength.jpg | 3:4 | RIM light, warm amber (Z2)
A studio portrait of a strength coach, a heavyset, powerful man in his forties, standing tall at the lockout of a deadlift, a loaded barbell with black plates held at his hips on straight arms; the ends of the bar may run out of the frame.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

[33] coach-hiit.jpg | 3:4 | RIM light, white-hot with a red halo (Z5)
A studio portrait of a HIIT coach, an athletic woman in her early thirties, frozen mid-air in a tuck jump with knees high and arms swinging, a burst of chalk dust around her feet catching the light.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

[34] coach-functional.jpg | 3:4 | RIM light, vivid orange (Z3)
A studio portrait of a functional training coach, a tall man in his late twenties, at the top of a kettlebell swing: the kettlebell floating at chest height on straight arms, hips locked.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

[35] coach-yoga.jpg | 3:4 | RIM light, soft neutral white (Z1)
A studio portrait of a yoga teacher, a slender woman in her thirties, seen from behind balancing in tree pose with her palms pressed together high above her head, perfectly still.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

[36] coach-mobility.jpg | 3:4 | RIM light, soft neutral white (Z1)
A studio portrait of a mobility and stretching coach, a wiry man in his forties, in a deep lunge with one arm reaching high overhead, the long lines of his body traced by the light.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

[37] coach-pilates.jpg | 3:4 | RIM light, warm amber (Z2)
A studio portrait of a pilates coach, a woman in her thirties with a strong, toned build, balancing in a pilates teaser (a V-sit) on a black mat, arms reaching forward parallel to her raised legs.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

[38] coach-swim.jpg | 3:4 | RIM light, warm amber (Z2)
A studio portrait of a swimming coach, a broad-shouldered man in his thirties, seen from behind with his arms stretched overhead in a streamline position, hands stacked, water droplets on his skin sparkling in the rim light.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

[39] coach-dance.jpg | 3:4 | RIM light, vivid orange (Z3)
A studio portrait of a dance-fitness coach, a woman in her mid-twenties in a cropped top and loose training pants, caught mid-spin with one arm flung out and her long hair fanning out in an arc.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

[40] coach-running.jpg | 3:4 | RIM light, vivid orange (Z3)
A studio portrait of a running coach, a lean woman in her late thirties, frozen mid-stride: one knee driving forward, arms pumping, the sole of the rear shoe catching the light.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

[41] coach-head.jpg | 3:4 | RIM light, scarlet red (Z4)
A studio portrait of the club's head coach, a solidly built man in his late forties, standing square to the camera with his arms crossed and a stopwatch on a cord around his neck; a calm, commanding presence.
A full-length figure centered in the frame at the same scale as every other coach portrait, with clear space above the head and below the feet for card graphics. The head is turned away or lowered so the face stays completely in shadow.
People only as silhouettes, from behind or with faces turned away into shadow.

When all 12 images of this pass are done, write: PASS 3 DONE.
```

## Pass 4

```text
PASS 4 OF 4: vertical hero, goal cards, details and service rooms (16 images, shots 42 to 57)

STYLE BIBLE (applies to every image)
This is one continuous evening photoshoot for "Kadens", a large three-storey fitness club in Kazan where every workout is planned around the member's heart rate. The club's name never appears in any image. Every image shows the same club:
- a black rubber floor made of compressed crumb with fine grey and scarlet flecks
- raw board-formed concrete walls, blackened steel, black acoustic baffles on the ceiling
- thin scarlet-red LED lines: the club's signature light
- matte-black, unbranded equipment; black bumper plates with no markings
- smoked oak only in the calm zones (yoga and pilates studios, spa, locker room)
- members wear black, graphite or white sportswear; coaches wear black with a thin scarlet stripe on the sleeve

LIGHT MODES (every shot names its mode)
PULSE: low-key and dramatic. The main light comes from scarlet-red linear LED lines behind and above the scene; it carves glowing red rim-light edges along bodies and equipment, and a thin atmospheric haze turns it into visible beams. Everything else falls into deep near-black shadow, with a faint cool-grey fill so shapes stay readable. Palette: near-black asphalt, graphite, scarlet red (#FF3A24) and chalk-white highlights.
STEEL: clean, cool neutral-white top light from long linear ceiling fixtures falls evenly on matte-black equipment and a black rubber floor; a thin scarlet-red LED strip along the base of the walls and the edges of the lifting platforms is the only accent colour; the far corners of the room fall off into shadow. Palette: matte black, graphite, raw concrete grey, chalk white and one thin line of scarlet red.
CALM: soft, warm and dim, like the last minutes of a sunset; low amber light washes across the floor from slots near the floor line, leaving long gentle shadows and no harsh contrast; a faint deep-red glow far in the background ties it to the rest of the club. Palette: warm graphite, smoked oak, sand, dim amber and a whisper of deep red.
WATER: the pool hall is dark; the water glows from within, lit by underwater lights in cool aqua-white that throw moving caustic patterns onto the walls and ceiling; the pool edge carries a thin scarlet-red accent line that reflects in the water. Palette: black, deep teal, aqua-white and one scarlet accent.
RIM: a studio portrait on a seamless near-black backdrop with a light haze. A single strong rim light from directly behind the subject outlines the whole silhouette in the colour given for the shot; a very faint cool fill from the front keeps the body a deep, almost black silhouette with no facial features visible. The backdrop, camera distance and light setup are identical across the whole coach series; only the rim colour changes. Palette: near-black backdrop, deep shadow and the colour given for the shot along the edges.
STREET: blue hour sliding into night; a light rain has just stopped and the wet asphalt mirrors every light; warm street lamps, a cool deep-blue sky and the scarlet glow of the club's windows. Palette: deep blue dusk, black, warm sodium-orange street light and scarlet red.

Photo style: Premium editorial sports photography for a large modern fitness club, shot on a full-frame camera with fast prime lenses. Cinematic and gritty, true-to-life skin and material textures with visible sweat and chalk, crisp highlights, deep but not crushed blacks, subtle fine film grain. Photorealistic.
People: adults of different ages, genders and body types, shown only as silhouettes, from behind or cropped. Never a visible face.
Never: text, lettering, numbers or weight markings, logos or brand marks, readable screens, watermarks, visible faces, children, collages or grids.

HOW TO WORK
1. Generate every shot below as a separate photorealistic image, in the listed order, at the listed aspect ratio and the highest resolution you can.
2. Right before each image, write its file name on its own line (for example: hero.jpg).
3. One image per shot. Do not combine shots into a grid or collage.
4. A shot marked TWIN must reuse the image of the shot it names as its base: keep the same camera angle, framing and subject and change only what the shot describes. If that image is not in this chat, ask me to attach it.
5. Coach portraits are one series: the same backdrop, camera distance, figure scale and light for every coach. Only the pose and the rim colour change.
6. If you can only make a few images per reply, stop after them and wait. When I write "continue", resume from the next number.

SHOTS

[42] hero-mobile.jpg | 9:16 | PULSE light
TWIN of [01] hero.jpg: Recompose it as a vertical frame: keep the same athlete, pose, haze and scarlet rim light, place the athlete centered in the lower half of the frame, and extend the dark haze upward so the top 45% of the frame is almost empty soft shadow for a large headline.
People only as silhouettes, from behind or with faces turned away into shadow.

[43] zone-kids.jpg | 3:2 | CALM light
The kids' club inside the fitness club, empty before a session: a low bouldering wall with rounded holds in scarlet, white and graphite, soft black gym mats, a low wooden balance beam and big soft foam blocks. The same concrete walls and black rubber floor as the rest of the club, but softer and friendlier.
Light for this shot: soft, even, warm-white light that feels friendly and safe, with the club's thin scarlet LED line along the base of the wall.
No people in this shot.

[44] zone-lockers.jpg | 3:2 | CALM light
A premium locker room: rows of matte-black lockers with no numbers, a long smoked-oak bench, a black stone floor, a vanity counter with round mirrors softly backlit in warm light, and a neat stack of folded black towels with thin scarlet stripes. Quiet and spotless; nobody is reflected in the mirrors.
No people in this shot.

[45] zone-fitbar.jpg | 3:2 | STEEL light
The club's fit-bar at night: on a raw concrete counter stand three tall glasses of smoothies (deep beetroot red, bright green and a pale protein shake), a bowl of bananas and a brushed-steel blender; behind the counter, open shelves with jars and glasses and a thin scarlet LED line under the shelf. Inviting after training.
No people in this shot.

[46] goal-lean.jpg | 4:5 | PULSE light
A macro shot of two hands gripping the handle of a rowing machine at the finish of a stroke, forearms tense, beads of sweat flying off the skin and glowing in scarlet rim light. Dark haze behind. Only hands and forearms in the frame.
Keep the subject in the lower two thirds of the frame and leave calm dark space at the top for a title.
Only parts of the body in the frame, cropped so that no face is visible.

[47] goal-endurance.jpg | 4:5 | PULSE light
A close-up of a cycling shoe clipped into the pedal of a studio bike at full speed: the crank and flywheel blurred into a spin, the shoe sharp, orange-scarlet light glinting on the steel and on the sweat of the calf. Only the foot and lower leg in the frame.
Keep the subject in the lower two thirds of the frame and leave calm dark space at the top for a title.
Only parts of the body in the frame, cropped so that no face is visible.

[48] goal-strength.jpg | 4:5 | STEEL light
A macro shot of chalk-covered hands closing around the knurled grip of a black barbell, a puff of white chalk dust hanging in the cool top light, the steel knurling in crisp detail. Only hands in the frame.
Keep the subject in the lower two thirds of the frame and leave calm dark space at the top for a title.
Only parts of the body in the frame, cropped so that no face is visible.

[49] goal-health.jpg | 4:5 | CALM light
Bare hands and feet planted on a black yoga mat in a downward-dog pose, seen from a low side angle; warm amber light slides across the oak floor. Calm and grounded. Only hands, feet and forearms in the frame.
Keep the subject in the lower two thirds of the frame and leave calm dark space at the top for a title.
Only parts of the body in the frame, cropped so that no face is visible.

[50] detail-rubber-floor.jpg | 1:1 | STEEL light
A flat top-down macro texture of black rubber gym flooring made of compressed rubber crumb with fine grey and scarlet flecks, evenly lit with soft raking light that reveals the grain. A uniform pattern from edge to edge with no objects, usable as a seamless background texture.
No people in this shot.

[51] detail-chalk.jpg | 4:5 | PULSE light
Two hands clapping a handful of white chalk, frozen in a large explosive cloud of chalk dust against a pure black background; the cloud glows with scarlet rim light on one side and cool white on the other. The hands sit at the bottom of the frame and the cloud fills the upper two thirds.
Only parts of the body in the frame, cropped so that no face is visible.

[52] detail-hr-strap.jpg | 1:1 | PULSE light
A black heart-rate chest strap with a small plain sensor pod lies coiled on a black rubber floor next to a folded black towel with a thin scarlet stripe; a single scarlet LED glow grazes the scene from the side and picks out the texture of the strap. A still life seen from above at a slight angle.
No people in this shot.

[53] detail-plates.jpg | 3:2 | STEEL light
A tight stack of matte-black bumper plates on a steel plate tree, their flat rubber faces completely unmarked, the edges catching a thin line of scarlet light; beside them a black barbell with sharp knurling rests in the J-hooks of a rack. Shallow depth of field, graphic and heavy.
No people in this shot.

[54] detail-towel-bottle.jpg | 1:1 | CALM light
A folded black cotton towel with a thin scarlet stripe and a brushed-steel water bottle on a smoked-oak locker-room bench, warm soft light from the side, dark lockers out of focus behind.
No people in this shot.

[55] detail-led-line.jpg | 16:9 | PULSE light
A long scarlet LED line on a dark concrete wall and its reflection in a polished black floor, the reflection slightly rippled; far out of focus, a dumbbell rack as soft dark shapes. Very minimal and mostly black, the red line crossing the whole frame horizontally at the lower third.
No people in this shot.

[56] detail-wristband.jpg | 1:1 | PULSE light
A close-up of a wrist wearing a black silicone club access wristband with a thin scarlet inner edge, the hand wrapped in white athletic tape resting on a black barbell; scarlet rim light, dark haze. Only the hand and wrist in the frame.
Only parts of the body in the frame, cropped so that no face is visible.

[57] empty-gym.jpg | 16:9 | PULSE light
An empty gym floor late at night after closing: the lights are off except for one pool of scarlet light from above, in which a single black dumbbell lies alone on the black rubber floor; the rest of the gym fades into darkness with faint outlines of racks. Quiet, a little melancholic and a little funny.
No people in this shot.

When all 16 images of this pass are done, write: PASS 4 DONE.
```
