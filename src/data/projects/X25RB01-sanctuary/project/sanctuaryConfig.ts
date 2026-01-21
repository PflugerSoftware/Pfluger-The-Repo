import type { ProjectConfig } from '../../../../components/blocks/types';

export const sanctuaryConfig: ProjectConfig = {
  id: 'X25-RB01',
  title: 'Sanctuary Spaces',
  code: 'X25-RB01',
  subtitle: 'Transitions to Wellbeing - Intentional Design Practice in School Buildings',
  category: 'psychology',
  researcher: 'Katherine Wiley, Braden Haley, Alex Wickes',
  totalHours: 120,
  accentColor: '#9A3324',

  blocks: [
    // Overview Section
    {
      type: 'section',
      id: 'section-overview',
      data: { title: 'Overview' },
    },
    {
      type: 'text-content',
      id: 'overview-intro',
      data: {
        content: `Each year as summer turns to fall, young children step inside a school for the first time, marking a celebrated milestone in the journey to adulthood. Attending school for the first time can be a challenging experience for a child. In particular, the transition from a familiar and safe home life to an unfamiliar and sometimes institutional-feeling school can be an impediment to growth.

New surroundings, routines, and relationships can be overstimulating. Studies show that **feeling safe and secure is an essential requirement for learning and development to happen**. With this awareness in mind of the psychological impact design has on building users, how can we craft early childhood environments that welcome, comfort, and inspire?

As designers, we strive to create sanctuaries where new learners can flourish, discovering and developing their potential. Design should balance the tangible elements - scale, shape, color, and texture - with features that transcend a physical description - biophilic connections, acoustical design, and sunlight - that shape a child's sensory experience.`,
      },
    },
    {
      type: 'key-findings',
      id: 'overview-findings',
      data: {
        findings: [
          {
            title: 'Scale & Shape',
            value: 'Soothing Geometry',
            detail: 'Curved forms reduce perceived threats and support emotional safety',
            icon: 'shapes',
          },
          {
            title: 'Color',
            value: 'Cultural Context',
            detail: 'Color preferences vary by culture; design for belonging',
            icon: 'palette',
          },
          {
            title: 'Acoustics',
            value: 'Speech Clarity',
            detail: 'Poor acoustics impair learning; soft materials absorb noise',
            icon: 'volume-2',
          },
          {
            title: 'Biophilia',
            value: 'Nature Connection',
            detail: 'Natural elements reduce stress and enhance concentration',
            icon: 'leaf',
          },
        ],
      },
    },

    // Scale and Soothing Spatial Geometry
    {
      type: 'section',
      id: 'section-scale',
      data: { title: 'Scale and Soothing Spatial Geometry', sources: [1, 2, 3] },
    },
    {
      type: 'text-content',
      id: 'insight-scale',
      data: {
        content: `At a functional level, it is important to remember that the eye level and arm reach of a small child is much different than that of an average-sized adult. This consideration should inform the selection and placement of the physical elements the child interacts with. For example, a windowsill placed lower on the floor might allow a small child to benefit from the view.

The scale of rooms and spaces should also be considered. An unusually long hallway or an overly large, cavernous space has the effect of making small children feel lost and unfamiliar with their surroundings.

**The psychology behind shape suggests that the human brain associates sharp angles with alertness and potential threats, while curving shapes, which occur more naturally in nature, convey safety and approachability.** Research suggests that curved forms are consistently rated as more pleasing and less threatening (Bar & Neta, 2007).

The systems in the brain responsible for emotion and regulation - particularly the prefrontal cortex - mature more slowly than the reactive emotion centers, such as the amygdala. As a result, children can be more sensitive to environmental stressors and have fewer tools to self-regulate. Since heightened emotional states can impair attention and learning, spatial environments that help to reduce stress and perceived threats can support a child's emotional regulation and cognitive learning functions.

This idea can be explored in Pfluger's design for **Hidden Lake Elementary School**. In the shared learning space, organic moss-like seating elements invite play and comfort. Their soft, rounded forms serve as whimsical visual anchors but also as tactile, grounded places for rest or play. Overhead large, curved LED light fixtures mimic natural forms - the soft seat below helping to unify the space visually.`,
      },
    },
    {
      type: 'image-gallery',
      id: 'gallery-scale',
      data: {
        images: [
          {
            src: '/images/projects/X25RB01-sanctuary/x25rb01-shape-hidden-lake-es.jpg',
            alt: 'Shared Learning Space at Hidden Lake Elementary School',
            caption: 'Shared Learning - Hidden Lake ES - Pfluger Architects, 2023',
          },
          {
            src: '/images/projects/X25RB01-sanctuary/x25rb01-scale-del-valle-cdc-reading-nook.png',
            alt: 'Reading nook at Del Valle CDC',
            caption: 'Reading Nook - Del Valle CDC - Pfluger Architects',
          },
          {
            src: '/images/projects/X25RB01-sanctuary/x25rb01-scale-the-harvey-schools.jpg',
            alt: 'The Harvey Schools interior',
            caption: 'The Harvey Schools - Pfluger Architects',
          },
        ],
        columns: 3,
      },
    },

    // Color is Cultural
    {
      type: 'section',
      id: 'section-color',
      data: { title: 'Color is Cultural', sources: [4, 5, 6, 7, 8, 9] },
    },
    {
      type: 'text-content',
      id: 'insight-color',
      data: {
        content: `Color can play a profound role in shaping a child's sensory perception and emotional response, which is crucial when designing environments for learning and supporting cognitive development. While vibrant, highly saturated hues can energize a space, research indicates that an overabundance or poor coordination of colors, along with large quantities of patterning can overstimulate children, especially those with sensory sensitivities (Maule, Skelton, & Franklin, 2023).

**We can use color when designing for belonging; color can reflect culture and help us acknowledge home environments.** For example, historically in the United States, red has been associated with signals such as "stop" or "alarm." Research indicates that red can contribute to eye strain and irritability in specific contexts. Conversely, a study on Japanese elementary and high school students revealed a preference for red (Imai et al., 2020), underscoring the cultural influence on color preferences.

Therefore, when designing spaces for children, to cultivate a feeling of belonging it is essential to consider context - and what "home" means for those students.

In the case of **George Peabody Elementary School** in Oak Cliff, colors were used as accents in an energized space like the cafeteria. The selected hues - purple, yellow, green, and blue - align with the top preferences for children while the remainder of the space remains neutral. With enhanced natural daylighting, the colors activate the environment without creating visual overwhelm.`,
      },
    },
    {
      type: 'image-gallery',
      id: 'gallery-color',
      data: {
        images: [
          {
            src: '/images/projects/X25RB01-sanctuary/x25rb01-peabody-elementary-school-dallas-isd-griffith-int-15.jpg',
            alt: 'Cafeteria at George Peabody Elementary School',
            caption: 'Color Tuning a Cafeteria - George Peabody ES - Pfluger Architects, 2024',
          },
        ],
        columns: 1,
      },
    },

    // Acoustics for Positive Learning Outcomes
    {
      type: 'section',
      id: 'section-acoustics',
      data: { title: 'Acoustics', sources: [10, 11, 12, 13] },
    },
    {
      type: 'text-content',
      id: 'insight-acoustics',
      data: {
        content: `Acoustical quality is an important but often overlooked school design factor that directly impacts student learning outcomes and teacher effectiveness. Poor acoustics inside classrooms negatively affect the teaching and learning processes, especially at the lowest grades of education, making proper acoustical design critical for younger students who are developing foundational learning skills.

Suitable acoustical design in classrooms and other learning spaces enhances speech clarity and limits background noise to protect speech quality for both the teacher and student. **Higher speech intelligibility results in a positive effect on learning outcomes.**

The measurable benefits extend beyond academic performance to encompass behavioral and health outcomes. Studies have shown that following improvements to classroom acoustics, teachers have reported higher student engagement and improved results in on-task behavior.

**Acoustic design strategies include:**
- Design in acoustic buffer zones between noise sensitive classrooms and areas prone to higher activity
- Reduce reverberation using soft, sound-absorbing materials such as rugs, fabric curtains, cork boards, and acoustical panels
- Add soft tips or pads to the bottom of tables and chairs
- Add a speech-reflective zone above the teacher's presentation area
- Consider audio distribution systems with teacher microphone and speakers`,
      },
    },

    // Materiality
    {
      type: 'section',
      id: 'section-materiality',
      data: { title: 'Materiality', sources: [13, 14] },
    },
    {
      type: 'text-content',
      id: 'insight-materiality',
      data: {
        content: `Materials in a safe and welcoming space should evoke comfort, not just durability. Sometimes a home or school is a first sanctuary space - how can we create spaces that are filled with soft, tactile, natural materials like wood, fabric, and warm colors? In the past, institutional buildings trended toward hard, cold finishes that felt alienating. Studies in environmental psychology indicate that children have strong tactile sensitivity, and overly sterile environments could provoke unease (Evans, 2006).

The design of **Dorothy Martinez Elementary School** challenged that paradigm. In the school's dining and gathering space, a mix of materials creates an experience that feels both functional and emotionally grounded. Warm-toned wood-looking luxury vinyl tile is used, balancing the acoustic ceiling tiles designed to absorb excess sound - a vital feature in large active spaces.

Tall, wooden slat panels with felt backing provide acoustic treatment as well and physically warm the double-height volume space, while floor materials subtly shift in tone and texture to define space without overwhelming it. The effect is inviting and sensory aware.

**Materiality also affects what we hear and how we feel.** According to Christensson (2018), poor acoustics can be a barrier to learning, increasing cognitive load and making speech harder to understand. This influences an emphasis on using sound absorbing materials to help quiet a room while creating a warm, grounded auditory landscape where children can flourish.`,
      },
    },
    {
      type: 'image-gallery',
      id: 'gallery-materiality',
      data: {
        images: [
          {
            src: '/images/projects/X25RB01-sanctuary/x25rb01-martinez-elementary-final-10152.jpg',
            alt: 'Gathering Space at Dorothy Martinez Elementary School',
            caption: 'Gathering Space - Dorothy Martinez ES - Pfluger Architects, 2024',
          },
        ],
        columns: 1,
      },
    },

    // Lighting Design
    {
      type: 'section',
      id: 'section-lighting',
      data: { title: 'Lighting Design', sources: [15, 16, 17, 18] },
    },
    {
      type: 'text-content',
      id: 'insight-lighting',
      data: {
        content: `Lighting design serves as a fundamental environmental factor in early childhood learning spaces, directly influencing children's physical development, cognitive abilities, and overall learning experience.

Research demonstrates that exposure to appropriate lighting can improve concentration, enhance cognitive abilities, and regulate sleep patterns. Conversely, poor lighting can lead to irritability, restlessness, eye strain, and difficulty with focus and attention.

**The benefits of natural daylight are significant for young learners**, as increased light during the daytime is broadly associated with beneficial effects on social-emotional, cognitive, and physical health outcomes. Exposure to bright light may significantly increase the brain's ability to grow new pathways and retain information. Bright light boosts mood and concentration, which is crucial for maintaining young children's engagement during learning activities.

Lighting solutions should support both developmental needs and educational objectives in early childhood settings.`,
      },
    },

    // Connection to Nature
    {
      type: 'section',
      id: 'section-nature',
      data: { title: 'Connection to Nature', sources: [19, 20, 21] },
    },
    {
      type: 'text-content',
      id: 'insight-nature',
      data: {
        content: `The integration of natural elements and biophilic design principles in early childhood learning facilities provides substantial developmental and educational benefits that extend across multiple domains of child growth.

Studies have shown that exposure to nature has many benefits including social development, better concentration, increased short-term memory and reduced stress. **Connections with nature can also engage the senses and spark young learners' curiosity.**

When it comes to incorporating biophilic elements in the design of schools and early childhood learning, there are several strategies:
- Biophilic and natural elements can be incorporated through plants and living walls
- Provide views to outdoor natural areas
- Provide direct access to outdoor areas, courtyards, playgrounds, sensory gardens and growing gardens`,
      },
    },
    {
      type: 'image-gallery',
      id: 'gallery-nature',
      data: {
        images: [
          {
            src: '/images/projects/X25RB01-sanctuary/x25rb01-courtyard-final.jpg',
            alt: 'Courtyard with natural elements',
            caption: 'Courtyard Design - Pfluger Architects',
          },
        ],
        columns: 1,
      },
    },

    // Emotions Shape Learning
    {
      type: 'section',
      id: 'section-emotions',
      data: { title: 'Emotions Shape Learning', sources: [22, 23, 24] },
    },
    {
      type: 'text-content',
      id: 'insight-emotions',
      data: {
        content: `Children can arrive at school in different emotional modes, and emotional loads can vary. Some can experience nerves, and others could be overstimulated from the transition from home to school environments. **Design that accounts for this range of emotions could offer pathways toward self-regulation.**

Thoughtful spatial programming that accommodates this emotional diversity is essential in cultivating emotional regulation and feelings of internal safety. Recent journals on education neuroscience emphasize the importance of autonomy, transition, and environmental cues in supporting a child's emotional development (Immordino-Yang, 2015).

Design can create zones of refuge - allowing students to find the sensory input or calm they need in the moment. This aligns with research showing that **emotional safety is a prerequisite for executive function and self-regulation** - critical components of learning to read (Blair & Raver, 2015).

This principle is beautifully explored at Dorothy Martinez and Braeburn Elementary Schools, where quiet nooks and pods are embedded into the building. Bold sculptural reading pods were created at Dorothy Martinez Elementary School, while dome-like sensory alcoves at Braeburn Elementary School offer enclosures that support withdrawal and emotional recalibration.

These carved-out sanctuaries invite quiet focus or co-regulation among peers. They are not just playful moments in the interior architecture - they reflect how built environments could support brain networks responsible for regulation and cognitive control.

**Positioning these nooks in activated areas and circulation zones means that children don't have to travel too far to access these environmental tools.** They can help support self-direction while reducing emotional and physical fatigue - important for younger learners who may be overwhelmed by longer transitions.`,
      },
    },
    {
      type: 'image-gallery',
      id: 'gallery-emotions',
      data: {
        images: [
          {
            src: '/images/projects/X25RB01-sanctuary/x25rb01-martinez-elementary-final-10607.jpg',
            alt: 'Media Center Reading Pods at Dorothy Martinez Elementary School',
            caption: 'Media Center Reading Pods - Dorothy Martinez ES - Pfluger Architects, 2024',
          },
        ],
        columns: 1,
      },
    },

    // Sources Section
    {
      type: 'section',
      id: 'section-sources',
      data: { title: 'Sources' },
    },
    {
      type: 'sources',
      id: 'sources-list',
      data: {
        sources: [
          // Scale and Shape
          { id: 1, title: 'Visual elements of subjective preference modulate amygdala activation', author: 'Bar, M., & Neta, M. (2007)', url: 'https://doi.org/10.1016/j.neuropsychologia.2007.03.017' },
          { id: 2, title: 'The neuroscience of emotion regulation development: Implications for education', author: 'Martin, R. E., & Ochsner, K. N. (2016)', url: 'https://doi.org/10.1016/j.cobeha.2016.06.006' },
          { id: 3, title: 'Impact of contour on aesthetic judgments and approach-avoidance decisions in architecture', author: 'Vartanian, O., et al. (2013)', url: 'https://doi.org/10.1073/pnas.1301227110' },
          // Color
          { id: 4, title: 'Color psychology: Effects of perceiving color on psychological functioning in humans', author: 'Elliot, A. J., & Maier, M. A. (2014)', url: 'https://doi.org/10.1146/annurev-psych-010213-115035' },
          { id: 5, title: 'Preferences of colors and importance of color in working surrounding of elementary school children', author: 'Glogar, P., Kasparova, J., & Machova, P. (2017)', url: 'https://library.iated.org/view/GLOGAR2017PRE' },
          { id: 6, title: 'General mechanisms of color lexicon acquisition: Insights from comparison of German and Japanese speaking children', author: 'Imai, M., et al. (2020)' },
          { id: 7, title: 'Color, arousal, and performance - A comparison of three experiments', author: 'Kuller, R., Mikellides, B., & Janssens, J. (2009)', url: 'https://doi.org/10.1002/col.20476' },
          { id: 8, title: 'The development of color perception and cognition', author: 'Maule, J., Skelton, A. E., & Franklin, A. (2023)', url: 'https://doi.org/10.1146/annurev-psych-032720-040512' },
          { id: 9, title: '20 Things Neuroscientist Wants You to Know (NeoCon 2024)', author: 'Dr. Sally Augustin, Design with Science' },
          // Acoustics
          { id: 10, title: 'Effects of Classroom Acoustics on Performance and Well-Being in Elementary School Children: A Field Study', author: 'Klatte, M., Hellbruck, J., Seidel, J., & Leistner, P. (2010)' },
          { id: 11, title: 'Acoustical Design in Education: Creating the Perfect Learning Environment', author: 'Kireiusa.com' },
          { id: 12, title: 'Influence of Classroom Acoustics on Noise Disturbance and Well-Being for First Graders', author: 'Astolfi, A. (2019)' },
          { id: 13, title: 'Good acoustics for teaching and learning', author: 'Christensson, J. (2018)' },
          // Materiality
          { id: 14, title: 'Child development and the physical environment', author: 'Evans, G. W. (2006)', url: 'https://doi.org/10.1146/annurev.psych.57.102904.190057' },
          // Lighting
          { id: 15, title: 'Turning on the light: Thinking about Lighting Issues in Child Care', author: 'Alexander (2008)' },
          { id: 16, title: 'The importance of Good Lighting in Child-Friendly Spaces', author: 'Reed (2023)' },
          { id: 17, title: 'The effects of light in children: A systematic review', author: 'Westwood (2023)' },
          { id: 18, title: 'Lighting in Early Childhood Environment', author: 'Shivarama (2014)' },
          // Nature
          { id: 19, title: 'Take it Outside: A History of Nature-Based Education', author: 'Prochner (2021)' },
          { id: 20, title: 'Nature-Based Learning: Why it\'s Essential in Early Childhood', author: 'International School Ho Chi Minh City' },
          { id: 21, title: 'Biophilic Design: Why Biophilia in Education gets an A+', author: 'Inprocorp.com (2020)' },
          // Emotions
          { id: 22, title: 'Emotions, Learning, and the Brain: Exploring the Educational Implications of Affective Neuroscience', author: 'Immordino-Yang, M. H. (2015)' },
          { id: 23, title: 'School readiness and self-regulation: A developmental psychobiological approach', author: 'Blair, C., & Raver, C. C. (2015)', url: 'https://doi.org/10.1146/annurev-psych-010814-015221' },
          { id: 24, title: 'Large-scale brain networks in affective and social neuroscience: Towards an integrative functional architecture of the brain', author: 'Barrett, L. F., & Satpute, A. B. (2013)', url: 'https://doi.org/10.1016/j.conb.2012.12.012' },
        ],
      },
    },
  ],
};
