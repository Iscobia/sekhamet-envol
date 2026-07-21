window.FONDATION_SUPPORT = {
  meta: {
    id: "fondation-support",
    title: "FONDATION",
    subtitle: "La base pour évoluer sereinement",
    storageKey: "fondation_support_completed_sections_v2",
    formStorageKey: "fondation_support_forms_v2"
  },

  sections: [
    {
      id: "intro",
      label: "Fondation",
      shortLabel: "Introduction",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="intro">
          <p class="support-kicker">Bonus - Fondation</p>
          <h1>La base pour évoluer sereinement</h1>
          <div class="support-card support-card--soft">
            <p>
              Ce support accompagne ton parcours FONDATION. Il te permet de prendre du recul sur
              ton environnement, ton entourage, tes schémas relationnels, ton rapport à toi-même
              et la façon dont tu soutiens — ou non — ta propre expansion.
            </p>
          </div>
        </section>
      `
    },

    {
      id: "je-fais-le-point",
      label: "I - Je fais le point",
      shortLabel: "I - Je fais le point",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="je-fais-le-point">
          <h1>I - Je fais le point</h1>

          <p>
            Avant de commencer à analyser en détail, je te propose de commencer par un point très
            concret sur la qualité de ton environnement : pour chaque question que je t’ai préparée, liste en
            vrac ce qu’il te vient à l’esprit.
          </p>

          <p>
            L’idée est de te donner un recul objectif général sur ton environnement et ton rapport à lui.
          </p>

          <div class="support-card support-card--practice support-dynamic-form" data-support-form="checkin-home">
            <h3>Exercice Pratique - Je fais le point</h3>

            <div class="support-form-stack">
              <label class="support-field">
                <span class="support-field-label">Actuellement, comment te sens-tu chez toi, à ton domicile ?</span>
                <textarea class="support-textarea" rows="4" data-support-input="feelingsHome"></textarea>
              </label>

              <label class="support-field">
                <span class="support-field-label">Qu’est-ce qui t’y plait ?</span>
                <textarea class="support-textarea" rows="4" data-support-input="likesHome"></textarea>
              </label>

              <label class="support-field">
                <span class="support-field-label">Y a-t-il quelque chose qui t’y pèse ? Si oui, comment peux-tu agir pour que cela ne te pèse plus ?</span>
                <textarea class="support-textarea" rows="5" data-support-input="heavinessHome"></textarea>
              </label>

              <label class="support-field">
                <span class="support-field-label">À quelle fréquence vas-tu dans un milieu de verdure (même un parc citadin) ? Que pourrais-tu mettre en place pour te ressourcer efficacement au moins une fois par semaine ?</span>
                <textarea class="support-textarea" rows="5" data-support-input="greenery"></textarea>
              </label>

              <label class="support-field">
                <span class="support-field-label">La qualité de l’eau que tu consommes et celle de ton contexte vibratoire (ondes wifi, bluetooth etc) a un incidence à la fois forte et subtile. Si tu devais charger de l’eau avec une pensée, que choisirais-tu ? « Je m’aime », « J’ai confiance en moi », « Merci »… ou autre chose ?</span>
                <textarea class="support-textarea" rows="4" data-support-input="waterMantra"></textarea>
              </label>
            </div>

            <div class="support-card support-card--note support-inline-note">
              <p>
                Exemple: choisis une bouteille en verre à laquelle tu répéteras 9 fois ton mantra au moins 10 minutes
                avant de boire son eau (3 fois à voix haute, 3 fois à voix basse et 3 fois dans ta tête). Tu peux la
                préparer en avance.
              </p>
            </div>

            <div class="support-form-meta" data-support-save-status="checkin-home"></div>
          </div>
        </section>
      `
    },

    {
      id: "influence-entourage",
      label: "II - Le facteur humain / 1. L’influence consciente, inconsciente et subtile de notre entourage",
      shortLabel: "II / 1. Influence de l’entourage",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="influence-entourage">
          <h1>II - Le facteur humain : observe ton approche à ton entourage et à tes aspirations</h1>
          <h2>1. L’influence consciente, inconsciente et subtile de notre entourage</h2>

          <p>
            D’après les recherches de l’Institut HeartMath (cf Sources), les êtres humains diffusent un
            rayonnement électromagnétique en fonction de leurs émotions. Ces émissions se propagent
            dans un rayon de plusieurs mètres autour du corps. Nos contacts humains vont donc non
            seulement nous affecter dans notre conscient, par les relations conscientes que l’on entretient,
            mais aussi au niveau subtil.
          </p>

          <p>
            L’approche consciente te permet d’estimer si ton entourage t’apporte réellement ce que tu
            recherches au plus profond de toi. Te freine-t-il ou te porte-t-il vers tes objectifs ? T’offre-t-il un
            regard complémentaire ? En quelle mesure acceptes-tu ou peux-tu t'ouvrir aux personnes de ton
            entourage pour discuter de tes aspirations afin de prendre un recul bienveillant sur ta vie ?
            Couche ces questions sur le papier pour chaque membre de ton entourage. Cela t’oblige à
            conscientiser les réponses et à ne pas fuir devant tes pensées.
          </p>

          <p>
            On parlera davantage de l’impact de l’entourage dans le chapitre suivant. On part du principe
            que ce qui t’énerve chez les autres n’est pas résolu chez toi : ça te permettra de réfléchir déjà à
            ton rapport à autrui avant de l’explorer en détail. 😉
          </p>
        </section>
      `
    },

    {
      id: "effet-miroir",
      label: "2. Effet miroir : faisons le point sur ton entourage passé et présent",
      shortLabel: "2. Effet miroir",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="effet-miroir">
          <h2>2. Effet miroir : faisons le point sur ton entourage passé et présent</h2>

          <p>Prends d’abord un petit recul sur ton parcours :</p>

          <div class="support-card support-card--practice support-dynamic-form" data-support-form="effet-miroir-checkin">
            <div class="support-form-stack">
              <label class="support-field">
                <span class="support-field-label">Quelles qualités et quels défauts avais-tu dans ton enfance et dans ton adolescence ?</span>
                <textarea class="support-textarea" rows="4" data-support-input="pastQualitiesDefects"></textarea>
              </label>

              <label class="support-field">
                <span class="support-field-label">Quelles sont les qualités que tu as cultivées avec l’âge et les défauts que tu as transcendés ?</span>
                <textarea class="support-textarea" rows="4" data-support-input="grownQualitiesDefects"></textarea>
              </label>
            </div>

            <div class="support-form-meta" data-support-save-status="effet-miroir-checkin"></div>
          </div>

          <p>
            Une fois que tu as un premier regard sur ton propre parcours, nous allons observer ce que tu
            penses de ton entourage. </p> 
          <p> 
            Je te donne un tableau dynamique pour lister les personnes que tu côtoies actuellement :
            cliques sur "Ajouter une personne" pour ajouter une personne, ou "Supprimer" si tu veux supprimer l'entrée.
          </p> 
          <p>  
            Ce tableau doit t’aider à faire le point la qualité de ton entourage : on est la moyenne des 5 personnes que
            l’on côtoie le plus. Si leur contact nous alourdit, alors on aura tendance à stagner ou nous éloigner de nous-même.
            Si au contraire elles nous apaisent ou nous offrent un contact agréable, elles ont de fortes chances de nous accepter
            tel.les que nous sommes ou tel.le que nous voulons devenir.
          </p>

          <p>Prends bien le temps de penser aux qualités et défauts de chacun.</p>
        
          <h2>Exercice Pratique - Je fais le point sur qualité de mon entourage</h2>

          <div class="support-card support-card--practice support-dynamic-form" data-support-form="entourage-quality">
            <div class="support-people-list" data-support-people-list></div>

            <div class="support-form-actions">
              <button type="button" class="support-btn support-btn--ghost support-add-person-btn" data-support-action="add-person">
                + Ajouter une personne
              </button>
            </div>

            <div class="support-card support-card--note support-inline-note">
              <p>
                Maintenant que tu as terminé ce tableau, regarde si tu as des traits récurrents chez ces personnes : qu’il s’agisse de défauts ou de qualités, les traits que tu cites peuvent parfois résulter d’un effet miroir de ton propre état d’être actuel. 
              </p>
            </div>

            <div class="support-form-meta" data-support-save-status="entourage-quality"></div>
          </div>
        </section>
      `
    },

    {
      id: "victime-sauveur-bourreau-intro",
      label: "3. Victime ? Sauveur ? Bourreau ?",
      shortLabel: "3. Victime / Sauveur / Bourreau",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="victime-sauveur-bourreau-intro">
          <h2>3. Victime ? Sauveur ? Bourreau ?</h2>

          <p>
            La responsabilisation est vraiment quelque chose de difficile : elle implique que les
            conséquences de tes actes et de tes choix ne sont que de ton propre fait. Cela induit que tu
            sais choisir à qui tu parles, de quoi et comment, que tu fais les choix en fonction de toi-même
            mais en ayant conscience de ce qui t’entoure. C’est faire part de lucidité, mais aussi de force
            pour prendre les mesures nécessaires à une situation saine. Or, la réalité est souvent plus belle
            dans tes rêves que dans les faits, et l’être humain a tendance à occulter ce qui le dérange ou
            ce qui lui est inconnu.
          </p>

          <p>
            En fonction de ta posture de responsabilisation ou de déresponsabilisation, tu vas pouvoir
            adopter plusieurs comportements sociaux : on va développer ça maintenant.
          </p>
        </section>
      `
    },

    {
      id: "la-victime",
      label: "3.a) La Victime",
      shortLabel: "3.a) La Victime",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="la-victime">
          <h2>3.a) La Victime</h2>

          <p>
            Pour éviter de te responsabiliser, tu peux choisir une position de « victime », qui te permet de
            rejeter la faute sur une ou plusieurs autre.s personne.s. C’est sécurisant puisque tu te dis que
            « ce n’est pas ta faute », ce qui te permet de ne rien avoir à changer. Éventuellement, tu vas te
            voir des défauts imaginaires ou de réels défauts dont tu t’incrimines ouvertement pour que ton
            entourage te dise le contraire et que tu n’aies pas à les travailler. Tu peux aussi mettre en avant
            les actes d’un bourreau, qui sont souvent réellement peu acceptables mais que tu appuies sans
            accepter de prendre tes dispositions pour te sortir de l’emprise que tu dénonces plus ou moins
            consciemment.
          </p>
        </section>
      `
    },

    {
      id: "le-sauveur",
      label: "3.b) Le Sauveur",
      shortLabel: "3.b) Le Sauveur",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="le-sauveur">
          <h2>3.b) Le Sauveur</h2>

          <p>
            Le besoin de reconnaissance et de don de soi peuvent te pousser à aider des personnes qui
            s'auto-flagellent pour telle ou telle situation ou relation déplaisante. Il peut bien sûr arriver que
            tu tombes sur des personnes qui ont réellement besoin d’aide et qui sont momentanément
            perdues, mais souvent c’est juste un manque d’attention ou de la paresse interne. Et si ces
            personnes-là ne décident pas de se prendre en main par elles-mêmes, elles puiseront ton
            énergie jusqu’à ce que tu n’en puisses plus. Parfois, tes propres ami.e.s peuvent se mettent dans
            des situations que tu sais malsaines. C’est dur de ne pas les aider, mais dans ce cas, les écouter
            sans forcément se laisser entraîner est la meilleure chose à faire, en espérant que la situation se
            règle. Ce qui fait mal, c’est quand elle se perpétue ou que la personne la perpétue elle-même
            sans vouloir lâcher la dépendance… Auquel cas son contact devient toxique, puisqu’elle
            t’entraîne dans son illusion en accaparant le temps et l’énergie que tu lui attribues pour la
            soutenir.
          </p>

          <p>
            En essayant d’aider les victimes sans les remettre en question, les sauveurs les confortent dans
            leur illusion, ce qui va rendre les « victimes » reconnaissantes vis-à-vis d’eux. Il y a alors une
            dépendance entre victime et sauveur, puisque le sauveur donne son énergie en échange de
            reconnaissance et la victime se repose sur le sauveur pour valider ses propos. L’un donne son
            énergie à l’autre et le légitimise.
          </p>
        </section>
      `
    },

    {
      id: "le-bourreau",
      label: "3.c) Le Bourreau",
      shortLabel: "3.c) Le Bourreau",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="le-bourreau">
          <h2>3.c) Le Bourreau</h2>

          <p>
            La victime peut aussi devenir un bourreau, quand la frustration se fait trop grande. Elle peut
            commettre des actes de violence sans en prendre la responsabilité, parce que c’est « normal »
            ou « parce que [le bourreau] l’a bien cherché, il le mérite ». Là aussi, l’aveuglement, son propre
            langage défaillant et sa propre violence font qu’elle refuse de prendre ses responsabilités. Se
            mettre à la place de l’autre lui est trop dur, parce que ça la met face à elle-même. Donc plutôt
            que de gérer sa colère ou la violence qui crie en elle-même, la victime devenue bourreau la fait
            sortir sur quelqu’un d’autre, parfois son bourreau initial. La victime devient bourreau et le
            bourreau devient victime.
          </p>
        </section>
      `
    },

    {
      id: "parfois-lun-et-lautre",
      label: "3.d) Et si je suis parfois l’un et parfois l’autre ?",
      shortLabel: "3.d) Et si je suis parfois l’un et parfois l’autre ?",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="parfois-lun-et-lautre">
          <h2>3.d) Et si je suis parfois l’un et parfois l’autre ?</h2>

          <p>
            Souvent, on peut être les trois à la fois : moi-même, en examinant davantage ces schémas, je
            m’aperçois que je dois rester attentive à ne pas partir dans l’un d’eux ! Pour t’offrir le meilleur
            recul possible, j’ai préparé quelques questions pour chaque schéma relationnel. Commence par
            celui qui te parle le plus… ou qui t’agace particulièrement : c’est un signe qu’il mérite ton
            attention ! Ensuite, explore les autres pour aller plus loin et éviter de passer à côté de certains
            aspects de ta réalité. Nous pourrons en discuter lors de notre prochaine séance, en groupe ou en
            individuel.
          </p>
        </section>
      `
    },

    {
      id: "exercices-victime",
      label: "3.→ Exercices pour la Victime",
      shortLabel: "3.→ Exercices pour la Victime",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="exercices-victime">
          <h2>→ Exercices pour la Victime</h2>

          <div class="support-card support-card--exercise">
            <ul>
              <li><strong>Exprimer sur un papier</strong> ce que je ressens de la situation. Mettre des mots clairs sur ce que je reproche à l’autre ou aux autres, pourquoi leurs réactions me font du mal.</li>
              <li><strong>Puis-je exprimer mes propres torts</strong> sans me sentir vulnérable ou sur la défensive ? Que pourrais-je changer pour transformer la situation, soit en dialogue et évolution commune, soit pour en sortir ?</li>
              <li><strong>Que dis mon entourage de ma situation ?</strong> Y a-t-il quelque chose que je n’accepte pas ? Ce que je refuse dans cette situation pourrait-il être à l’origine de ma douleur ?</li>
              <li><strong>La personne que je perçois comme un bourreau</strong> serait-elle prête à changer ou à prendre mon avis en compte si je le lui exprimais directement et sans m’énerver ou me comporter comme une victime ? Cherche-t-elle à me convaincre et à diriger mon raisonnement ou me laisse-t-elle m’exprimer librement ?</li>
            </ul>
          </div>

          <div class="support-card support-card--exercise">
            <h3>Exercice :</h3>
            <p>
              imaginer une situation de dialogue jusqu’à ce que je ressente la posture intérieure qui me
              permet de m’exprimer avec lucidité et intégrité.
            </p>
          </div>

          <div class="support-card support-card--note">
            <p><u><strong>Note :</strong></u> <em>quand tu te mets en position de victime, ce que tu émets ou que tu véhicules via ton comportement invite à t’écraser. Si tu changes de posture dans la situation, tu changes le dialogue.</em></p>
          </div>

          <div class="support-card support-card--exercise">
            <ul>
              <li><strong>Comment pourrais-je me sortir moi-même</strong> de la situation dont je me sens prisonnier.e ? De quoi est-ce que je ne me sens pas capable, ou quelles sont les risques que je ne veux pas affronter ? Si je perds certaines choses, qu’est-ce que je gagnerais en échange (vraiment, sans me berner sur ce que dit mon « bourreau » ou ce que dictent mes peurs) ? Comment puis-je rompre la situation dans laquelle je me trouve et que puis-je faire pour m’assurer que j’y arrive ?</li>
            </ul>
          </div>
        </section>
      `
    },

    {
      id: "exercices-sauveur",
      label: "3.→ Exercices pour le Sauveur",
      shortLabel: "3.→ Exercices pour le Sauveur",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="exercices-sauveur">
          <h2>→ Exercices pour le Sauveur</h2>

          <div class="support-card support-card--exercise">
            <ul>
              <li><strong>Quels sont mes émotions</strong> et mes ressentis physiques lorsque je prends en charge la ou les personnes qui souffrent et que j’ai choisi d’aider ?</li>
              <li><strong>La situation d’aide que j’offre</strong> me draine-t-elle ou me donne-t-elle de l’énergie ?</li>
              <li><strong>Quelle est la raison</strong> pour laquelle j’aide cette ou ces personnes ? Est-ce que j’attends quelque chose (retour émotionnel, matériel ou gratitude) ?</li>
              <li><strong>Dans ma propre vie</strong>, comment pourrais-je ressentir naturellement de la reconnaissance ou de la gratitude envers moi-même ? Qu’est-ce que je fais naturellement qui peut aider naturellement les autres, et qui est le public qui valoriserait le plus mon savoir faire ?</li>
            </ul>
          </div>
        </section>
      `
    },

    {
      id: "exercices-bourreau",
      label: "3.→ Exercices pour le Bourreau",
      shortLabel: "3.→ Exercices pour le Bourreau",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="exercices-bourreau">
          <h2>→ Exercices pour le Bourreau</h2>

          <div class="support-card support-card--exercise">
            <ul>
              <li><strong>De quoi est-ce que j’accuse les autres ?</strong> Faire une liste des accusations (ça t’oblige à les accepter, tu ne peux plus les fuir).</li>
              <li><strong>Ma victime est-elle</strong> une seule personne ou un groupe de personnes regroupées sous un signe particulier ? Qu’est-ce qui fait que je choisis cette personne ou ce groupe de personne en particulier ? Qu’est-ce qui me rend intérieurement légitime de m’en prendre à elle/eux ? Faire une liste de ce qui m’irrite ou m’incite, dans son/leur comportement, à m’en prendre à elle/eux.</li>
              <li><strong>Si je devais renvoyer ces accusations contre moi-même</strong>, à quoi feraient-elles allusion ? Quels sont mes comportements qui peuvent provoquer ce que je reproche à ma ou mes victime.s ou qui se rapprochent le plus de ces reproches ?</li>
            </ul>
          </div>
        </section>
      `
    },

    {
      id: "qualite-relations",
      label: "4. Qualité des relations",
      shortLabel: "4. Qualité des relations",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="qualite-relations">
          <h2>4. Qualité des relations</h2>

          <p>
            La qualité de tes relations est cruciale : elles peuvent te rassurer, te porter, te faire plonger dans
            l’incompréhension et la peine, t’enchaîner, ou juste te faire stagner.
          </p>

          <p>
            Ce sont des exemples parmi d’autres, les relations sont vivantes et peuvent changer d’une
            semaine ou d’une année à l’autre ! Leur capacité d’évolution diffère selon les individus, ce qui
            fait que quand tu évolues AVEC une personne, alors cette relation est peut-être difficile mais
            aussi très fructueuse !
          </p>

          <p>
            Que développes-tu avec chaque membre de ton entourage ? D’où viennent tes forces et tes
            faiblesses, tes « qualités » et tes « défauts » ?
            Si tu sens le besoin de couper les ponts dans l’état actuel d’une relation, pourquoi le ferais-tu ?
            Est-ce légitime et que cela t’apporterait-il ?
          </p>

          <p>
            On est souvent surpris des portes qui s’ouvrent après des années d’absence, ou alors de celles
            qui s’ouvrent justement quand on coupe des contacts malsains. Je te conseille de réfléchir
            posément aux relations qui peuvent évoluer avec le temps, celles qui te portent et celles avec
            lesquelles tu serais soulagé.e de mettre de la distance. Non pas de couper forcément les ponts,
            mais savoir prendre des distances avec les personnes qui te maintiennent dans une situation ou
            un schéma qui te dessert afin de faire de la place pour des relations qui te poussent vers le
            haut.
          </p>

          <p>
            Passe en revue les membres de ton entourage. Les personnes avec qui tu as gardé contact,
            ceux que tu rejettes et ceux qui sont là sans forcément avoir de contact régulier, mais présents
            s’il t’arrive quoi que ce soit et que tu as besoin de te confier.
          </p>

          <div class="support-card support-card--exercise">
            <h3>Pour chaque personne avec qui tu es actuellement en contact :</h3>
            <ul>
              <li>Pourquoi restes-tu en contact avec cette personne ?</li>
              <li>Te sens-tu obligé.e de garder contact avec cette personne ? Pourquoi ?</li>
              <li>Que t’apportent cette personne ?</li>
              <li>Te fait-elle subir un poids quelconque ? Ce poids est-il supérieur ou inférieur à la bienveillance ou les qualités que cette personne partage avec toi ?</li>
            </ul>
          </div>

          <div class="support-card support-card--exercise">
            <h3>Pour chaque personne avec qui tu es actuellement en froid :</h3>
            <ul>
              <li>Cultives-tu de la rancœur envers cette personne ?</li>
              <li>Quelles émotions ressens-tu quand tu penses à chacune des personnes avec qui tu es en froid ? De la tristesse ? De la colère ? De la peur ?.. de la frustration ?</li>
              <li>Si tu regardes avec objectivité les raisons pour lesquelles vous êtes en froid, quelle est ta part de responsabilité ?</li>
              <li>Avant ce froid, la personne t’était-elle toxique, neutre ou bénéfique ?</li>
              <li>Gagnerais-tu à rétablir la situation avec cette personne ou à la laisser derrière toi ?</li>
            </ul>
          </div>

          <div class="support-card support-card--note">
            <p>
              Dans l’exercice qui suit ce chapitre, je te donne un petit rituel à faire pour chaque membre de
              ton entourage et chaque personne avec qui tu es en froid. Ça s’appelle les « petits bonhommes
              aux allumettes », parce que les dessins peuvent être très simplistes. Ça donne l’impression que
              les personnes sont dessinées avec des allumettes ! En réalité, tu n’as besoin que d’une feuille,
              un ou plusieurs feutres et une paire de ciseaux. 😉 Ce rituel tout simple va t’aider à couper
              consciemment les liens négatifs avec les personnes que tu choisis de représenter. Assez parlé,
              je te laisse tester !
            </p>
          </div>
        </section>
      `
    },

    {
      id: "bonhommes-allumettes",
      label: "5. Couper les liens toxiques : l’approche ludique des « Petits Bonhommes aux Allumettes »",
      shortLabel: "5. Bonhommes aux Allumettes",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="bonhommes-allumettes">
          <h2>5. Couper les liens toxiques : l’approche ludique des «Petits Bonhommes aux Allumettes»</h2>

          <p>
            Pour accompagner la décision de faire le ménage dans les liens nocifs que tu as pu vivre
            jusqu’à aujourd’hui, je te propose un petit « rituel » qui s’appelle « les Bonhommes aux
            allumettes ». Il y a plusieurs tutos sur le net mais je te donne ma version, qui diffère légèrement
            de ce que tu pourras trouver. 🙂
          </p>

          <p>
            Pour chaque personne, prends un quart de feuille A4 ou une demi feuille. Il te faudra dans l’idéal
            un stylo ou feutre noir et des feutres ou crayons violet, bleu foncé, bleu ciel, vert clair, jaune,
            orange, rouge et doré. Sinon, tout peut être au stylo uni même si je trouve que les couleurs
            permettent de mieux intégrer le processus, surtout si tu t’intéresses à l’énergétique.
          </p>

          <div class="support-bonhommes-steps">
            <div class="support-bonhommes-step">
              <picture class="support-bonhommes-media">
                <source srcset="data/fondation/bonhommes-aux-allumettes/BonhommesAllumettes1.webp" type="image/webp">
                <img src="data/fondation/bonhommes-aux-allumettes/BonhommesAllumettes1.png" alt="Étape 1 des Petits Bonhommes aux Allumettes">
              </picture>
              <div class="support-card support-card--exercise">
                <h3>1. Dessine-toi et dessine la personne avec qui tu veux rompre les liens négatifs.</h3>
                <p>
                  Il ne s’agit pas de couper les ponts, juste les dépendances affectives ou les
                  manipulations.
                </p>
                <p>
                  Pas besoin d’une représentation détaillée mais tu peux le faire si tu en
                  ressens l’envie ou le besoin.
                </p>
              </div>
            </div>

            <div class="support-bonhommes-step">
              <picture class="support-bonhommes-media">
                <source srcset="data/fondation/bonhommes-aux-allumettes/BonhommesAllumettes2.webp" type="image/webp">
                <img src="data/fondation/bonhommes-aux-allumettes/BonhommesAllumettes2.png" alt="Étape 2 des Petits Bonhommes aux Allumettes">
              </picture>
              <div class="support-card support-card--exercise">
                <h3>2. Trace les liens invisibles qui unissent certaines parties clés de votre corps.</h3>
                <p>
                  Le choix de ces parties est lié à croyances ancestrales sur la
                  constitution énergétique du corps (les chakras).
                </p>
                <p>
                  Les couleurs aident pas ne sont pas nécessaires.
                </p>
              </div>
            </div>

            <div class="support-bonhommes-step">
              <picture class="support-bonhommes-media">
                <source srcset="data/fondation/bonhommes-aux-allumettes/BonhommesAllumettes3.webp" type="image/webp">
                <img src="data/fondation/bonhommes-aux-allumettes/BonhommesAllumettes3.png" alt="Étape 3 des Petits Bonhommes aux Allumettes">
              </picture>
              <div class="support-card support-card--exercise">
                <h3>3. Coupe ces liens en conscientisant ta volonté avec la phrase : « Je choisis de couper tout lien négatif ou aliénant avec [cette personne], ici et maintenant. »</h3>
                <p>
                  Ouvre-toi aux sensations de ton corps et ton cerveau. Coupe en conscience : tu verras
                  que certaines parties de ton corps réagissent plus que d’autres quand tu coupes certains
                  traits.
                </p>
              </div>
            </div>

            <div class="support-bonhommes-step">
              <picture class="support-bonhommes-media">
                <source srcset="data/fondation/bonhommes-aux-allumettes/BonhommesAllumettes4.webp" type="image/webp">
                <img src="data/fondation/bonhommes-aux-allumettes/BonhommesAllumettes4.png" alt="Étape 4 des Petits Bonhommes aux Allumettes">
              </picture>
              <div class="support-card support-card--exercise">
                <h3>4. Une fois que tu as coupé les liens, on prends soin de te sceller et protéger ton énergie avec un cercle doré (si tu as la couleur, sinon tu peux aussi faire des petits rayons comme un soleil).</h3>
                <p>
                  Inconsciemment comme symboliquement, ça te permet de recentrer ton énergie sur toi-même. Tu
                  acceptes de rayonner ton énergie propre, la personne que Tu es sans
                  l’interférence de cette personne.
                </p>
                <p>
                  De la même façon, tu isoles aussi
                  cette personne de toi en lui souhaitant
                  du bien quelque soit ce qu’elle ait pu
                  te faire (oui, ce n’est pas simple).
                  Trace le même cercle protecteur qu’à
                  Toi. Tu agis ainsi en faveur du pardon
                  et laisse toute rancune derrière toi. Ça
                  te permet de te laisser surprendre si
                  la relation est encore actuelle, ou
                  juste de laisser de mauvais souvenirs
                  conscients ou inconscients derrière toi.
                </p>
              </div>
            </div>

            <div class="support-bonhommes-step">
              <picture class="support-bonhommes-media">
                <source srcset="data/fondation/bonhommes-aux-allumettes/BonhommesAllumettes5.webp" type="image/webp">
                <img src="data/fondation/bonhommes-aux-allumettes/BonhommesAllumettes5.png" alt="Étape 5 des Petits Bonhommes aux Allumettes">
              </picture>
              <div class="support-card support-card--exercise">
                <h3>5. Ma petite touche perso !</h3>
                <p>
                  Tu peux plier les petits papiers et les
                  brûler dans un récipient qui ne
                  craint pas le feu. J’aime
                  beaucoup les regarder brûler
                  parce que je sens encore des
                  choses se défaire en moi à ce
                  moment-là, et les papiers de
                  certaines personnes vont avoir
                  beaucoup plus de mal à se
                  consumer que d’autres. Je le
                  sens en moi aussi : je suis
                  curieuse de connaître ton vécu et peux me joindre à ton rituel si tu veux avoir un appui
                  lors d’une séance individuelle ou de groupe. Je ferai un sondage si le groupe est
                  intéressé de faire l’expérience en simultané. Le feu transmute les énergies et il est pour
                  moi une étape tout aussi importante que le reste.
                </p>
              </div>
            </div>
          </div>
        </section>
      `
    },

    {
      id: "faisons-le-point",
      label: "6. Faisons le point",
      shortLabel: "6. Faisons le point",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="faisons-le-point">
          <h2>6. Faisons le point</h2>

          <p>
            Avant de passer à la suite, j’aimerais te proposer de faire un point rapide et efficace : prends une
            feuille et un crayon.
          </p>

          <div class="support-card support-card--exercise">
            <ul>
              <li><strong>Sur une note de 0 à 10,</strong> comment notes-tu la compatibilité de tes activités actuelles avec tes envies réelles ? Si tu n’es pas à 10, que devrais-tu changer ?</li>
              <li><strong>Pourquoi manges-tu ?</strong>
                <ul>
                  <li>parce que tu as faim ?</li>
                  <li>pour combler un émotionnel instable ?</li>
                  <li>par habitude ?</li>
                  <li>Pour compenser l’insécurité provoquée par un environnement qui n’est pas propice à ton expansion ?</li>
                </ul>
              </li>
              <li><strong>Si tu ne manges pas, est-ce parce que :</strong>
                <ul>
                  <li>tu te sens nourri.e « d’autre chose » ? (joie, légèreté, émotion)</li>
                  <li>parce que tu ne veux pas accepter une situation ?</li>
                  <li>parce qu’une émotion ou une sensation physique te noue le ventre ?</li>
                  <li>parce que ton corps te « dit » qu’il en a besoin ?</li>
                </ul>
                <p>
                  Le jeûne est bénéfique, mais si tu as envie de le faire durer plus de 3 jours il me
                  semble absolument nécessaire que tu ressentes les besoins réels de ton corps et que
                  tu comprennes ses réactions physiques et physiologiques. Si tu as un doute mais que
                  les effets revitalisants du jeûne t’intéressent, je te conseille de te faire suivre par un.e
                  professionnel.le.
                </p>
              </li>
              <li><strong>À quelle fréquence</strong> trouves-tu un contact avec la Terre ?</li>
            </ul>
          </div>

          <p>
            Si tu es honnête avec toi-même, tu sens ce qui te porte ou non. Si quelque chose ne te porte
            pas, c’est que tu le fais soit par automatisme, soit avec la patte qui traîne, soit carrément en
            forcing. Et là c’est l’alarme qui sonne… Plus tu forces sans voir le bout, plus tu t’épuises. Si tu
            gères mal ton énergie, tu perds ton temps et aussi ce qui te fait Vivre.
          </p>

          <p>
            Pose-toi avec toi-même : qu’aimes-tu vraiment vivre ou faire ? As-tu besoin d’être plus entouré.e
            ou d’avoir plus de temps seul.e ? Quels types de personnes aimerais-tu à tes côtés ?
          </p>

          <p>
            N’oublie pas que tout n’est pas tout noir ou tout blanc, rien n’est figé. Certaines relations restent
            en arrière-plan sans être coupées, d’autres sont immuables et d’autres éphémères.
          </p>

          <div class="support-card support-card--note">
            <p>Il faut juste que tu trouves une façon de :</p>
            <ul>
              <li>sécuriser un lieu de ressourcement quand tu en as besoin</li>
              <li>pouvoir parler à quelqu’un d’ouvert, de fiable et de constructif quand tu as besoin d’un recul sur ta situation</li>
              <li>t’entourer de personnes qui comprennent tes projets de vie et qui te sont de bons conseils pour avancer sereinement dans la direction que tu as choisie. Pas besoin de soutien permanent, mais savoir qu’ils sont là et être là pour eux en retour s’ils en ont besoin est très précieux.</li>
            </ul>
          </div>

          <p>
            À moins de vraiment sentir que ce que l’on te demande t’épuise rien qu’à en parler, évite de
            prendre plus que tu ne donnes. La générosité apporte la générosité !
          </p>
        </section>
      `
    },

    {
      id: "travaille-ton-mindset",
      label: "7. Travaille ton mindset",
      shortLabel: "7. Travaille ton mindset",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="travaille-ton-mindset">
          <h2>7. Travaille ton mindset</h2>

          <p>
            Il est naturel de chercher l’approbation des autres, d’attendre qu’ils reconnaissent notre valeur et
            s’intéressent à ce que nous faisons. Mais derrière ce besoin de validation, il y a souvent un
            manque de confiance en soi. En réalité, ce que nous cherchons, ce n’est pas seulement
            l’approbation des autres, mais surtout du soutien, parce que nous ne nous sentons pas encore
            capables de nous porter seuls.
          </p>

          <p>
            Le travail le plus puissant que j’ai eu à faire sur moi, c’est justement celui de la confiance en
            soi. Une vraie confiance, celle qui ne dépend ni du regard des inconnus, ni de l’opinion de nos
            proches, même pas de la personne qui partage notre vie. Quand tu développes cette force
            intérieure, tu es capable d’assumer pleinement tes pensées, tes paroles et tes actions, sans
            crainte du jugement extérieur.
          </p>

          <p>
            Et comme toute force, la confiance se travaille. C’est un véritable programme de musculation
            intérieure ! Plus tu l’entraînes, plus elle devient solide et naturelle.
          </p>

          <p>Je vais te proposer quelques outils pour aller dans ce sens.</p>

          <h2 style="margin-top:50px">Précision importante : l’impact de ta voix intérieure et de tes mots sur ton corps</h2>

          <p>
            Lorsque nous parlons - à voix haute ou intérieurement - ce ne sont pas de simples syllabes qui
            se forment : c’est une interaction entre le langage, le cerveau et le corps.
          </p>

          <p>
            Des recherches montrent que le contenu de nos pensées et de notre « self-talk » (dialogue
            intérieur) est relié à des réponses physiologiques mesurables. Par exemple, des pensées ayant
            un ton négatif ou orientées vers le passé sont corrélées à des niveaux plus élevés de cortisol,
            une hormone centrale du stress, tandis que des pensées orientées vers le futur ou plus positives
            tendent à atténuer ces marqueurs de stress.
          </p>

          <p>
            De manière similaire, des études sur le self-talk en contexte d’effort physique montrent que la
            nature de nos mots influence non seulement notre ressenti, mais aussi des réponses biologiques
            comme le rythme cardiaque et les niveaux de cortisol.
          </p>

          <p>
            Les caractéristiques de la voix elles-mêmes - comme le ton, l’intonation ou la modulation -
            portent des informations liées à l’état émotionnel du locuteur. La science a observé que les voix
            plus tendues et plus aiguës sont associées à des niveaux plus élevés de cortisol, tandis que des
            voix plus calmes et posées sont perçues comme moins stressées biologiquement.
          </p>

          <p>
            Enfin, les interventions utilisant la vocalisation (chants, sons, voix apaisantes) montrent des
            effets mesurables sur la physiologie : certaines pratiques vocales diminuent les niveaux de
            cortisol et les sentiments d’anxiété, et peuvent même moduler des réseaux neuronaux liés à la
            régulation émotionnelle.
          </p>

          <p>
            Ce que cela nous enseigne est simple mais profond : le langage que nous dirigeons vers nous-
            mêmes n’est pas neutre pour notre corps. Une voix intérieure douce, bienveillante et pleine de
            gratitude engage des circuits de régulation, favorise un état parasympathique apaisé et peut
            contribuer à diminuer l’inflammation et la charge de stress. À l’inverse, une auto-critique dure,
            rapide ou anxieuse renforce les boucles physiologiques du stress et maintient le système en
            hypervigilance.
          </p>
        </section>
      `
    },

    {
      id: "confiance",
      label: "a) Explore et reprogramme consciemment tes réactions corporelles et émotionnelles au mot « confiance »",
      shortLabel: "a) Confiance",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="confiance">
          <h2>a) Explore et reprogramme consciemment tes réactions corporelles et émotionnelles au mot « confiance »</h2>

          <p>
            Le premier exercice que je te propose repose sur la répétition du mot « Confiance » de trois
            manières différentes : à voix haute, à voix basse et dans ta tête.
          </p>

          <div class="support-card support-card--exercise">
            <ul>
              <li><strong>À voix haute :</strong> Dis-le clairement, trois fois. En Kundalini Yoga, on dit que cela agit sur le conscient, te permettant d’affirmer et d’ancrer cette idée dans la réalité. La science moderne confirme que parler à voix haute renforce la mémoire et impacte positivement ta perception de toi-même.</li>
              <li><strong>À voix basse :</strong> Murmure le mot « Confiance » trois fois. Cette étape touche l’inconscient, comme un message subtil que tu envoies à ton monde intérieur. La psychologie montre que le langage intérieur influence nos croyances profondes et aide à reprogrammer nos schémas mentaux.</li>
              <li><strong>Dans ta tête :</strong> Répète maintenant ce mot en silence. Dans la tradition yogique, cette pratique est reliée à l’âme, une manière de vibrer intérieurement avec cette intention. D’un point de vue neuroscientifique, les recherches sur la méditation montrent que la répétition mentale calme le système nerveux et améliore la clarté mentale (à condition que la répétition soit positive, bien sûr).</li>
            </ul>
          </div>

          <p>
            À chaque étape, observe ce qui se passe en toi : tes sensations physiques, tes pensées, tes
            émotions. Peut-être qu’un doute surgit, une tension se manifeste, ou au contraire, une détente
            s’installe. Écoute simplement ton intérieur.
          </p>

          <p>
            Cet exercice ne sert pas seulement à renforcer ta confiance en toi, mais aussi à cultiver la
            confiance dans la vie. Il t’aide à lâcher le contrôle sans perdre pied, à rester ancré.e tout en
            étant réceptif.ve aux solutions qui t’entourent.
          </p>

          <p>
            C’est simple mais puissant ! Laisse-toi guider par cette répétition et ressens comment elle
            transforme ton état intérieur.
          </p>
        </section>
      `
    },

    {
      id: "effet-miroir-allie",
      label: "b) Utilise l’effet miroir comme un allié",
      shortLabel: "b) Effet miroir comme un allié",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="effet-miroir-allie">
          <h2>b) Utilise l’effet miroir comme un allié</h2>

          <p>
            Lorsque tu observes ou que tu as l’impression d’observer de la réticence ou du désintérêt dans
            ton entourage pour ce qui te porte, demande-toi ce que tu cherches en eux. Sans forcément
            solliciter ton mental, écoute tes tripes. Quelles émotions ou quelles images te viennent ?
            Imagine que tu demandes ce soutien et cette validation à toi-même : tu es la personne qui sera
            le plus à tes côtésdans cette vie, tu dois pouvoir t’appuyer sur toi-même.
          </p>

          <p>
            C’est difficile au début, c’est normal. C’est un peu comme si tu essayais de tenir en équilibre la
            tête en bas à la seule force de tes bras (alors que tu n’as pas du tout la musculature pour!).
            C’est pas parce que tu te casses la figure au début et que ça a l’air infaisable que ça n’est pas
            réalisable. Je sais que tu peux le faire ! Je suis passée par là aussi, tu sais.
          </p>
        </section>
      `
    },

    {
      id: "toi-du-futur",
      label: "c) Rencontre ton/ta Toi du futur",
      shortLabel: "c) Toi du futur",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="toi-du-futur">
          <h2>c) Rencontre ton/ta Toi du futur</h2>

          <p>
            Cet exercice est là pour t’aider quand tu te sens seul.e, perdu.e, ou en manque de repères : il
            s’agit de te connecter à la version de toi-même que tu as envie de devenir.
          </p>

          <p>
            Ferme les yeux et imagine ton Toi idéal. Celui ou celle qui a déjà dépassé les obstacles que tu
            traverses aujourd’hui. Cette version de toi connaît déjà les réponses et sait exactement
            comment avancer.
          </p>

          <div class="support-card support-card--exercise">
            <p>Pose-lui des questions :</p>
            <ul>
              <li>Comment aurait-elle agi à ta place ?</li>
              <li>Quels conseils aimerait-elle te donner ?</li>
              <li>Quelle énergie, quelles émotions émane-t-elle ?</li>
            </ul>
          </div>

          <p>
            Maintenant, ressens pleinement cette version de toi : tranquille, joyeuse, apaisée, confiante…
            Prends quelques instants pour laisser ces sensations t’envahir. Elles sont déjà en toi.
          </p>

          <p>
            Le futur commence maintenant. Sois, dès aujourd’hui, la personne que tu veux devenir.
          </p>
        </section>
      `
    },

    {
      id: "expansion-contraction",
      label: "d) Observe ton état : expansion ou contraction ?",
      shortLabel: "d) Expansion ou contraction",
      trackCompletion: true,
      html: `
        <section class="support-section" data-section-id="expansion-contraction">
          <h2>d) Observe ton état : expansion ou contraction ?</h2>

          <p>
            Prends un instant pour scanner ton corps. Ressens-tu des tensions régulières ? Peut-être dans
            ton dos, tes épaules, ton ventre, ta mâchoire… Quand ces tensions apparaissent-elles ? Quels en
            sont les déclencheurs ?
          </p>

          <p>
            Observe-les. Identifie-les. Accepte-les. Sont-elles liées à une insécurité financière ou
            émotionnelle ? Un manque de confiance en toi ? Une peur sous-jacente ?
          </p>

          <p>
            Le simple fait de reconnaître l’origine d’une tension aide déjà à la relâcher. Plus tu acceptes ce
            qui la provoque, plus ton mécanisme d’auto-défense s’apaise et plus tu gagnes en clarté. C’est
            comme si tu te plaçais face à un intrus et que tu lui disais : « Je te vois. » Une fois qu’il est vu,
            il perd une grande partie de son pouvoir.
          </p>

          <div class="support-card support-card--focus">
            <p><strong>💡 Souviens-toi :</strong> tu ne peux pas être à la fois en contraction et en expansion.</p>
          </div>

          <p>
            Si ton corps est tendu, fermé, en repli, il en va souvent de même pour ton mental et tes
            émotions. Cela peut se traduire par du stress, du rejet, une sensation d’oppression, voire un
            sentiment de blocage.
          </p>

          <p>Mais l’inverse est aussi vrai.</p>

          <p>
            Quand tu choisis consciemment l’expansion, tu ouvres un nouvel espace. Tu te reconnectes à
            toi-même, tu reconnais tes limites sans les subir, tu acceptes tes responsabilités sans te
            surcharger. Tu grandis, tu te renforces, tu rayonnes.
          </p>

          <p>
            Alors, observe. Écoute les tensions de ton corps, comprends leur déclencheur et, petit à petit,
            relâche-les. Plus tu cultives l’expansion, plus tu avances avec fluidité et confiance. ✨
          </p>
        </section>
      `
    },

    {
      id: "sources",
      label: "III - Sources",
      shortLabel: "III - Sources",
      trackCompletion: false,
      html: `
        <section class="support-section" data-section-id="sources">
          <h1>III - Sources</h1>

          <div class="support-card support-card--source">
            <h3>1. Electromagnétisme et santé physique</h3>
            <ol>
              <li>
                <strong>Impact des ondes électromagnétiques (WiFi, Bluetooth, etc.) :</strong>
                <ul>
                  <li><strong>Pall, M. L. (2018).</strong> <em>Wi-Fi is an important threat to human health.</em> Environmental Research, 164, 405-416.<br>Ce papier explore les effets potentiels des ondes WiFi sur la santé humaine, suggérant que les ondes électromagnétiques peuvent perturber les fonctions cellulaires, y compris le stress oxydatif, le fonctionnement du système nerveux et les dommages à l'ADN.</li>
                </ul>
              </li>
              <li>
                <strong>L'eau et son rôle dans le corps humain :</strong>
                <ul>
                  <li><strong>Chaplin, M. (2000).</strong> <em>Water structure and science.</em> Website.<br>Martin Chaplin, un expert dans l'étude de l'eau, détaille la structure de l'eau et son rôle en tant que vecteur d'informations biologiques. Bien que son travail ne se concentre pas sur les ondes électromagnétiques, il souligne l'importance de l'eau structurée dans les processus biologiques.</li>
                </ul>
              </li>
              <li>
                <strong>Mise à la terre (Grounding) et ions négatifs :</strong>
                <ul>
                  <li><strong>Chevalier, G., Sinatra, S. T., Oschman, J. L., & Delany, R. M. (2012).</strong> <em>Earthing: Health implications of reconnecting the human body to the Earth's surface electrons.</em> Journal of Environmental and Public Health, 2012, 291541.<br>Cette étude démontre que le contact direct avec la Terre permet au corps d'absorber des électrons libres, ce qui a des effets anti-inflammatoires et aide à réduire le stress.</li>
                </ul>
              </li>
              <li>
                <strong>Effets des ions négatifs sur la santé :</strong>
                <ul>
                  <li><strong>Krueger, A. P., & Reed, E. J. (1976).</strong> <em>Biological impact of small air ions.</em> Science, 193(4259), 1209-1213.<br>Cette étude démontre que les ions négatifs peuvent avoir des effets bénéfiques sur la santé, y compris la réduction des symptômes de dépression, d'anxiété, et une amélioration de la respiration et du bien-être général.</li>
                </ul>
              </li>
              <li>
                <strong>Stress oxydatif et exposition aux ondes électromagnétiques :</strong>
                <ul>
                  <li><strong>Houston, B. J., Nixon, B., King, B. V., & Aitken, R. J. (2016).</strong> <em>The effects of radiofrequency electromagnetic radiation on sperm function.</em> Reproduction, 152(6), R263-R276.<br>Bien que centrée sur les spermatozoïdes, cette étude démontre que l'exposition aux ondes électromagnétiques peut causer un stress oxydatif, un mécanisme impliqué dans de nombreuses maladies et dysfonctionnements corporels.</li>
                </ul>
              </li>
            </ol>
          </div>

          <div class="support-card support-card--source">
            <h3>2. La vibration du cœur : les études de l’institut HeartMath</h3>
            <p>L'Institut HeartMath a mené plusieurs études sur la manière dont les émotions affectent le champ électromagnétique du cœur. Voici quelques références clés :</p>
            <ol>
              <li><strong>McCraty, R., Atkinson, M., & Tomasino, D. (2001).</strong> "Science of the Heart: Exploring the Role of the Heart in Human Performance."<br>Cette publication offre un aperçu des recherches de HeartMath sur la variabilité de la fréquence cardiaque (VFC) et la cohérence cardiaque, démontrant comment des émotions positives comme la gratitude ou l'amour génèrent un champ électromagnétique plus harmonieux.</li>
              <li><strong>McCraty, R., & Childre, D. (2010).</strong> "Coherence: Bridging Personal, Social, and Global Health."<br>Dans ce document, les auteurs explorent le concept de cohérence cardiaque et montrent comment la synchronisation entre le cœur, le cerveau, et les émotions crée des changements mesurables dans le champ électromagnétique du cœur.</li>
              <li><strong>McCraty, R., Atkinson, M., Tiller, W. A., Rein, G., & Watkins, A. D. (1995).</strong> "The effects of emotions on short-term power spectrum analysis of heart rate variability." American Journal of Cardiology, 76(14), 1089-1093.<br>Cette étude est l'une des premières à démontrer comment différentes émotions affectent la variabilité de la fréquence cardiaque et, par conséquent, le champ électromagnétique du cœur.</li>
              <li><strong>McCraty, R. (2015).</strong> "Heart-Brain Interactions, Coherence, and the Emerging Field of Heart Intelligence."<br>Ce travail explore plus en détail comment les émotions cohérentes et positives améliorent la synchronisation entre le cœur et le cerveau, et influence le champ électromagnétique du cœur.</li>
            </ol>
            <p>Ces études suggèrent que les émotions impactent directement le champ électromagnétique émis par le cœur et que les états émotionnels positifs augmentent la cohérence de ce champ, tandis que les émotions négatives tendent à le désordonner.</p>
          </div>

          <div class="support-card support-card--source">
            <h3>3. L’impact de ta voix intérieure et de tes mots sur ton corps</h3>
            <ul>
              <li><em>Mind your thoughts: Associations between self-generated thoughts and stress</em> — étude indiquant que des pensées de ton négatif sont associées à des niveaux augmentés de cortisol et d’alpha-amylase.</li>
              <li><em>Type of self-talk matters: Effects of positive vs negative self-talk on cortisol and physiological responses</em> — étude explorant comment différents types de dialogue intérieur influencent la réponse au stress.</li>
              <li><em>Human Stress Detection: cortisol and voice pitch during stress</em> — article montrant que des indicateurs vocaux liés au stress correspondent à des niveaux de cortisol mesurés.</li>
              <li><em>Exploring physiological effects of chanting</em> — étude montrant que vocalisations et chants peuvent réduire le cortisol et l’anxiété.</li>
              <li><em>Endogenous oxytocin, cortisol, and testosterone with group singing</em> — recherche indiquant que chanter ensemble influence biologiquement le stress et les émotions.</li>
            </ul>
          </div>
        </section>
      `
    }
  ]
};
