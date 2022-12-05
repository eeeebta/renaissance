class narrativeVis {
    constructor(parentElement, data, descData) {
        // Load relevant data
        this.parentElement = parentElement;
        this.data = data;
        this.songNames = [];
        this.descData = descData;
        this.songRef = {"I'M THAT GIRL": 0, "COZY": 1, "ALIEN SUPERSTAR": 2, "CUFF IT": 3, "ENERGY": 4, "BREAK MY SOUL": 5, "CHURCH GIRL": 6, "PLASTIC OFF THE SOFA": 7, "VIRGO'S GROOVE": 8, "MOVE": 9, "HEATED": 10, "THIQUE": 11, "ALL UP IN YOUR MIND": 12, "AMERICA HAS A PROBLEM": 13, "PURE/HONEY": 14, "SUMMER RENAISSANCE": 15};
        this.danceability = []

        // Descriptions for each used 
        this.descSpotSub = {"Danceability": "Danceability represents, based on Spotify's analysis, how danceable it is -- taking into consideration tempo and rhythm",
                            "Valence": "A higher valence score is attributed to the song being happier/euphoric, whereas lower is more negative/sad",
                            "Energy": "The intensity of a track -- like if it's fast or loud and energizing",
                            "Loudness": "Loudness of a track in decibels",
                            "Speechiness": "How vocal a track is. A lower score on this would mean that there are less vocals.",
                            "Instrumentalness": "The opposite of speechiness. A higher score means that there are more instruments than vocals.",
                            "Liveness": "A measure of if this song was performed live"}

        // Format data
        this.data.forEach((d) => {
            d.danceability = +d.danceability;
            d.energy = +d.energy;
            d.key = +d.key;
            d.loudness = +d.loudness;
            d.mode = +d.mode;
            d.speechiness = +d.speechiness;
            d.acousticness = +d.acousticness;
            d.instrumentalness = +d.instrumentalness;
            d.liveness = +d.liveness;
            d.valence = +d.valence;
            d.tempo = +d.tempo;
            this.songNames.push(d.name)
        })

        this.initVis();
    }

    initVis() {
        let vis = this;


        // init margins and height
        vis.margin = {top: 20, right: 30, bottom: 180, left: 60};;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`)

        vis.x = d3.scaleBand()
            .domain(this.songNames)
            .range([vis.width, 0]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom().scale(vis.x);

        vis.yAxis = d3.axisLeft().scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis x-axis-ibta axis-ibta")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.svg.append("g")
            .attr("class", "y-axis axis-ibta");

        vis.svg.select(".x-axis").call(vis.xAxis);

        vis.svg.select(".x-axis").selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)"); 


        vis.svg.append("path")
			.datum(vis.data)
			.attr("d", d3.line()
                .x((d) => {
                    return vis.x(d.name)
                })
                .y((d) => {
                    return vis.y(d.danceability)
                })
            )
			.attr("class", "line-ibta");

        vis.tooltip = d3.select("#circleTT")
                .attr("class", "ibta-tooltip col")

        vis.subjectiveLabel = d3.select("#spotifyLabelSubjective");

        vis.subjectiveLabel
                    .style("opacity", 1)
                    .html(`
                        <h3>Danceability</h3>
                        <p>${this.descSpotSub["Danceability"]}</p>
                `)

        d3.select("#filterNar")
            .on("change", () => {
                let selectedValue = d3.select("#filterNar").property("value");
                vis.subjectiveLabel
                    .style("opacity", 1)
                    .html(`
                        <h3>${selectedValue}</h3>
                        <p>${this.descSpotSub[selectedValue]}</p>
                `)
                vis.updateVis();
        })

        this.wrangleData()
    }

    wrangleData() {
        let vis = this;


        this.updateVis();
    }

    updateVis() {
        let vis = this;

        let selectedValue = d3.select("#filterNar").property("value").toLowerCase();

        let texts = d3.selectAll("text")
            .data(vis.data)


        texts.enter().attr('transform', 'rotate(45, ' + function (d) { return vis.x(d.name)} + ', ' + function (d) { return vis.y(d[selectedValue])} + ')')

        let circles = vis.svg.selectAll(".circles")
            .data(vis.data)

        vis.y.domain([d3.min(vis.data, (d) => {
            return d[selectedValue];
        }), d3.max(vis.data, (d) => {
            return +d[selectedValue];
        })]);

        vis.svg.select(".y-axis").call(vis.yAxis);

        circles.exit().remove();

        circles.enter()
            .append("circle")
            .merge(circles)
            .on("mouseover", function (e, d) {
                d3.select(this).attr("r", 8);
                
                vis.tooltip
                    .style("opacity", 1)
                    .html(`
                        <div style=""; padding: 20px">
                            <h3>${d.name}</h3>
                            <br>
                            <h5>Genius' Description<h6>
                            <p>${vis.descData[vis.songRef[d.name]].annotation.replace(`^#[^ !@#$%^&*(),.?":{}|<>]*$`, " ").replace("\\n", " ")}</p>
                            <p>${selectedValue[0].toUpperCase() + selectedValue.substring(1)} Value: ${d[selectedValue]}</p>
                            
                            
                        </div>`);

                
            })
            .on("mouseout", function (d, e) {
                d3.select(this).attr("r", 5)
                vis.tooltip
                    .style("opacity", 0)
                    .html(``);
            })
            .transition()
            .duration(100)
            .attr("class", "circles")
            .attr("fill", "#DDA54C")
            .attr("stroke", "none")
            .attr("cx", (d) => { return vis.x(d.name)+24})
            .attr("cy", (d) => { return vis.y(d[selectedValue]) })
            .attr("r", 5)
            

        let line = d3.select(".line-ibta");

        line
            .datum(vis.data)
            .transition()
            .duration(100)
            .attr("d", d3.line()
                .x((d) => {
                    return vis.x(d.name) + 24
                })
                .y((d) => {
                    return vis.y(d[selectedValue])
                })
            )

        

    }
}


class lyricVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.songRef = {"I'M THAT GIRL": 0, "COZY": 1, "ALIEN SUPERSTAR": 2, "CUFF IT": 3, "ENERGY": 4, "BREAK MY SOUL": 5, "CHURCH GIRL": 6, "PLASTIC OFF THE SOFA": 7, "VIRGO'S GROOVE": 8, "MOVE": 9, "HEATED": 10, "THIQUE": 11, "ALL UP IN YOUR MIND": 12, "AMERICA HAS A PROBLEM": 13, "PURE/HONEY": 14, "SUMMER RENAISSANCE": 15};

        this.songHighlights = {
            0: ['The sample present throughout the track originates from Memphis underground legend Tommy Wright IIIs 1994 Track ‘Still Pimpin, With the vocal chop performed by female hip-hop pionneer Princess Loko (Passed Away In 2020)\n', 'The choice of this sample is likely to pay homage to both memphis legends, and for there contributions to hip-hop in its infancy\n', '\n', 'She is addressing the people that say her popularity is because of her husband and her wealth, she is saying she wouldve been who she is without all of it.\n', '\n', 'Her influence is natural, she was born with it. Everyone that encounters her gets a boost from being associated with her. ex. Megan Thee Stallion got her 1st grammy due to her collab w/ Beyonce and has been going up ever since her impact on people is undeniable rather you like her music or not\n', '\n', 'Besides selling high-end luxury cars, automobile manufacturer Cadillac also makes and sells more “affordable” ones, like those in the DeVille series. On the ‘92 version, you can often see that those cars have Vogue Tyres: theyre a company that manufacture luxury tires, wheels and car accessories. Typically, you can distinguish Vogue Tyres as they often have a colored (mostly yellow or red) stripe on the tire.'],
            1: ['Here Beyoncé uses a metaphor to refer to how societies verbal aggression and discrimination towards black minorities and the LGBTQ+ community has ultimately lead to these people rising with pride and bulding up stronger communities.\n', 'Throughout Renaissance, genres such as House and music, originated at the clubs and ballroom scene are revisited and celebrated. An obvious message that transpires from the record is that creative black and queer folk pushed musics boundaries in their own spaces, built as an escape from a society that had alienated them and forced hate upon their identities.\n', '\n', 'Beyoncé shares in these lines that she loves the look of the scars on her body, that were probably the result of an emergency cesarean (otherwise known as a C-section) to birth her twins, Sir and Rumi Carter, on 13 June 2017. In her documentary Homecoming) she talks about the multiple complications she had during her pregnancy with the twins.\n', 'By singing these lines, Beyoncé clarifies that she is proud to be a mother, despite the physical (or mental) scars it mightve given her.\n', 'In a broader context, Beyoncé might also be referring to her metaphorical “battle scars,” in which she appreciates any hard time shes endured, as they helped to make her the person she is now.\n', '\n', 'In this line, Beyoncé might be recalling the “elevator incident” between her husband, JAY-Z, and her sister, Solange. This incident happened while the three, including a bodyguard, were on their way to leave the 2014 MET Gala party. Shortly after the party, a surveillance video of Solange attacking JAY-Z in an elevator got leaked. It fed a lot of speculation, especially towards JAY-Zs possible infidelity towards Beyoncé, that basically later got confirmed when Beyoncé released two years later the album Lemonade and JAY-Z 4:44 a year after that.\n', '\n', 'In 2020, trans icon, host and reality television personality Ts Madison posted the video B*tch Im BLACK on her YouTube channel. She got candidly honest about being a black (trans) person, and expressed with a drop of humor how tired she is of all the injustice black people have to face. The monologue got quickly praised, and even labeled as one of Ts Madisons most iconic speeches.\n', '\n', 'Beyoncé didnt just describe the Pride pride flag on “Cozy” - she specifically described Daniel Quasars “Progress” pride flag to bring to the forefront marginalized LGBTQ+ people of color, trans people, and those living with / lost to HIV/AIDS (https://twitter.com/BIacklsKing/status/1552951022066323458)\n', '\n'],
            2: ['The intro samples Foremost Poets 1998 track titled “Moonraker".\n', 'This sample is possibly used to introduce the experimental style of the song, due to Beyoncé noting her superstardom as extraterrestrial, thus matching the sound with something out of this world. With the songs unfamiliar sounds, the sample reminds the listeners that the song might be an unfamiliar one.\n', '\n', 'Beyoncé has had an extraordinary career, becoming the most rewarded lady in Grammy history. Beyoncé is shown as an extraterrestrial celebrity, a metaphor for self-love in knowing that you are unlike anybody else, by labeling her exclusive professional path as “number one” and her individuality as “the only one.” It means your attributes are so different from what people expect of you that, even though it appears alien to others, you still understand and enjoy who you are.\n', 'It should also be noted that Beyoncé speaks the word “one” four times in total – four is her favorite number.\n', 'This is likely a reference to her previous album Lemonade, in which Beyoncé sings about discovering the lies her partner has been telling her, especially about his infidelity.\n', 'On “Pray You Catch Me,” for instance, she also played with a similar metaphor:\n', '\n', 'Beyoncé plays with the idea of “the bar” in two different ways here:\n', 'The first line, “Stilettos kicking vintage crystal off the bar,” is much more literal, in which Beyoncé dances on top of a bar and causes her heels to knock over expensive, crystal glasses.\n', 'In regards to the second use of the word, “Category: bad bitch, Im the bar,” this line pays homage to the ballroom scene. Ballroom is an LGBTQ+ subculture that originated in New York City in the late 1960s. It was originally created by Black and Latine queer and trans youth who were frustrated with the existing restrictive and white-centered queer scene. One of the main features of ballroom is competing in various categories for prizes, trophies, and titles, such as “icon,” “legend,” “star”, and “bad bitch,” awarded by a panel of judges. While the idea of being called a “bad bitch” seems rather vulgar, the ballroom scene reversed its meaning to be one of excellence and pride.\n', 'By setting “the bar,” Beyoncé asserts herself as the standard for how other potential “bad bitches” should be evaluated.\n', '\n', 'This is an interpolation of Right Said Freds song Im Too Sexy.\n', 'It also serves as a reminder of her status.\n', 'By saying “Im too classy for this world,” or even “to be touched,” she claims that she is on a higher level than all of humanity. This furthers the “alien superstar” metaphor, as shes actually saying that shes so superior that shes basically a different species.\n', '“I paid them all in dust,” is actually a phrase thats from AAVE, which is heavily influential in ballroom culture, because of its roots within Harlem and PoC members of the LGBTQIA+ community.\n', 'Here, Beyoncés is probably paying homage to ballroom culture, which heavily influences this album. It also cements her position as a leader within her field, because its her call as to whether peoples ideas get acknowledged or whether they are “paid dust” (to ignore or to overlook).\n', 'This could be a reference to Princes song “Diamonds and Pearls” from his album with the same name, and “International Lover”. This could further be implied by the promotional images for the RENAISSANCE album, where Beyoncé can be seen toting Princes gun microphone, which he carried in live performances throughout his time with The New Power Generation.\n', 'Add that to the funky electronic drum beat that echoes some of Princes songs, along with the choice to wait to actually sing until the chorus hits (which mirrors Princes “Sexy MF”), and one can see that Beyoncé is probably making a subtle and heartfelt homage to fellow music icon Prince Rogers Nelson, who died on 21 April 2016.\n', '\n', 'This line seems to be an interpolation of Maya Angelous poem “Still I Rise”\n', 'It might also be a reference to Beyoncés own song, “Ego,” where “ego” is a double entendre for a penis.\n', '\n', 'This sample was taken from Barbara Ann Teers 20 minute speech titled “Black Theatre”.\n', 'Barbara Ann Teer was an American writer and producer. The writer died of natural causes in 2008 at the age of 71.'],
            3: ['No analysis on this one from genius :('],
            4: ['This is a reference to the 45th US President, the Republican Donald Trump, being voted out of office.\n', 'This is also a reference to the long lines to vote in Black areas, as a result of polls being closed to discourage voters. While this form of voter suppression is nothing new, these long lines made headlines in the lead up to the 2020 elections with some waiting in line for as long as 11 hours, but fought through it anyway to vote Trump out of office.\n', '\n', 'A double entendre! Beam is talking about posing on the front cover of Vogue magazine.\n', 'At the same time hes referencing the TV show “POSE”, which is about the ballroom community known for birthing “voguing.”\n', '\n', 'The dot-dot-dot that Beyonce is most likely an ellipsis. The punctuation mark (often animated in chat clients or iMessage to indicate that someone is typing) indicates that more information is coming and you continue to wait!\n', 'The “ooh, la-la-la” is an interpolation from Teena Maries “Ooo La La La,” which has been quoted/interpolated by a number of other artists, such as the Fugees in “Fu-Gee-La”.\n', 'The “dot, dot, dot,” might therefore maybe be a subtle, friendly shade towards Lauryn Hill – who is well known for her solo work, but also for her work within Fugees – as shes notorious for keeping her audience waiting for hours.\n', 'DUssé is a brand of cognac that both Beyoncé and JAY-Z frequently endorse in their music, as JAY-Z partially owns the brand. Here, Beyoncé uses the submachine gun Uzi to say that shes “taking multiple shots in quick succession.”\n', '\n', 'As “Karens” often get seen as right-wing members because of their blatant racism, you can say that during the events of January 6, quite some “Karens” turned officially into terrorists.'],
            5: ['This is a sample from the very influential artist, Big Freedias track, “Explode,” from her June 2014 album, Just Be Free.\n', '\n', 'Big Freedia—whos often credited as the one to popularize bounce music—first worked together with Beyoncé on her February 2016 hit, “Formation,” the lead single for Lemonade.'],
            6: ['The intro samples gospel vocal group The Clark Sisters 1981 track “Center of Thy Will”\n', '\n', 'Beyoncé describes RENAISSANCE as “a place to scream, release, feel freedom”. Throughout the masterpiece, she constantly alludes to God without incorporating a religious atmosphere to the album, as in CUFF IT. Rather than mocking church girls and rejecting divinities — as believed by some people in the comment section for the official lyric video on YouTube —, Beyoncé just wants you to remember that you belong to yourself. No one but yourself can define what frees your soul. This is a heartwarming part of the song with softly sung vocal acrobatics — a characteristic feature from R&B and gospel music —, few moments before diving into the memorable chorus.\n'],
            7: ['Beyoncé pays close attention to her partners emotions as they are always laid out in front of her.\n', 'Wearing ones heart on ones sleeve is a common saying that means a persons feelings are clearly evident to others.\n', 'One example that Beyoncé uses is catching the expression on her partners face when she delivers unfavorable news. No one wants to watch the person they love walking away and her partner makes it obvious with their body language and facial expressions.\n', '\n'],
            8: ['No analysis on this one from genius :('],
            9: ['This a reference to the biblical story of the “Crossing the Red Sea” from the Book of Exodus. It tells the story of the escape of Israelites after the Egyptians tried to chase them. They were led by Moses, one of the most important prophets in both Christianity and Judaism.\n', 'When Israelites arrived on the shore of the Red Sea, Moses held out his hand and split the sea into two, making a new, dry passage for them to cross to the other side and escape. Beyoncé is putting herself in the Moses position, commanding the crowd to part, move out her way and make space for her as she passes.\n', '\n', 'Bruk Up” is a dancing style created in the Jamaican Dancehall scene, in the early 1990s by George “Bruk Up” Adams.\n', 'A childhood bone infection – called osteomyelitis – is what gave Adams the signature moves of this style, with which he stunned the Brooklyn Dancehall and hip-hop scene when he moved to New York in the mid-1990s.\n', 'In this style, performative contortionist movements are used in one-on-one battles, resulting in a storytelling with characters defined by their special moves.\n', '\n', 'Chantilly Lace is a famous lace textile, that gets made with a bobbin. Its known for its fine ground, but also abundant detail of primarily flowers.\n', 'The fabrication of this kind of textile started in the 17th century, but it became more popular in the 18th century, especially for mourning wear (though later also for wedding dresses).\n', 'But the demand during the French Revolution declined drastically in France, as it became associated with royals such as Marie Antoinette, who often integrated the lace in their bombastic dresses. Even lacemakers were killed during this time, as they were seen as the designers and therefore also “protégés” of the wealthy.\n', 'Thanks to Napoleon I, the revival of Chantilly Lace began in the 19th century. Since then, it stayed popular, even through all the different fashion eras the centuries faced.\n', 'The demand of Chantilly Lace rose again in the 1980s, thanks to Madonnas Like a Virgin-era and her famous “Boy Toy”-outfit.'],
            10: ['A band is equal to $1.000, so when the word gets mentioned in its plural form, you must know were talking about a lot of money.\n', 'And what costs a lot of money? Well, you can certainly put Hermès bags on that list. Especially when it comes to their Birkin bags, as the prices can quickly stack up to six figures. The bags are loved by many celebrities, and its a popular line for handbag collectors.\n', 'Though it might not be Beyoncés favorite bag, as she sings later on the album, on the last track “SUMMER RENAISSANCE"\n', 'Therefore you can confidently say that the main use of the Birkins are to show off her wealth.\n', '\n', 'Ivy Park is Beyonces clothing line that she founded in 2016 along with businessman Philip Green. Beyonce has since assumed full ownership of the company after Green had sexual assault allegations brought against him. Ivy Park is partly named after Beyonces daughter, Blue Ivy Carter\n', '\n', 'RENAISSANCE is dedicated to Beyoncés Uncle Jonny, the nephew of her mother, Tina Knowles. He helped care for Beyoncé and her sister Solange when they were children, and he sewed Beyoncés dress for her high school prom. He passed from an AIDS-related illness in the late ‘90s.\n', '\n', 'In an interview on December 5, 2008 Bey stated:\n', '“ I dont normally curse. Maybe twice a year. I have to be really livid. Somebody saying things or scheduling something where Im not in control.”\n', 'This infidelity made her act outside of her character.\n', 'In context with the previous line, he could be eating it so good that it makes her talk “shit” as she stated for the song “Partition”\n', '\n', 'Beyoncé uses two common examples of body features that are typically seen as “imperfections” in women, particularly black and plus-sized women, to depart from the media narrative of what a womans body should or shouldnt look like and instead empower all types of bodies through her lyrics.\n', 'Note how stretchmarks on breasts are particularly common after pregnancy once the baby is born and skin streches back as the mothers body regains its shape. Scars may gradually fade but usually wont go away completely.'],
            11: ['Alkaline water has a higher pH compared to plain tap water which makes it basic as well as un-harmful to the skin.\n', 'However, Beyoncé employs wordplay to address the “drip” on her wrist. In this case, an “alkaline wrist” implies that she has “basic” jewellery, or in other phrases, its original. Following that, she later mentions the phrase “got that water,” which in the music scene, is a synonym for the word “drip.”\n', '\n', 'Freaknik was the annual spring break festival held in park near Atlanta University Center from 1983 until 1999. The festival was mostly attended by the students from historically black universities. It hosted events such are concerts, parties, basketball tournaments, rap sessions and film festivals.\n', 'Name Freaknik was coined by joining the words “freaky” and “picnic.” The citys most popular, eponymous magazine Atlanta referred to it as “the most infamous street party.”\n', 'In its most popular years, Freaknik was opened for general public and was attended by people from the United States, Canada, the Caribbean and Europe, with over 300,000 and 350,000 guest in 1990 and 1991 respectively.\n', '“Twelve in the trunk” refers to a 12" subwoofer installed in the trunk of a car, common in Miamis car culture during the 1980s when Miami Bass music was becoming popular.\n', 'Mastros is a restaurant chain that is known for their high-quality (and really expensive) steaks and seafood. Beyoncé and her husband JAY-Z have been frequently spotted having a dinner there.\n', 'It is possible to do luxurious private dinings at Mastros, at least if you have the money. Knowing that Beyoncé and JAY-Z have a combined net worth of $1.8 billion, it isnt a problem for them to afford it. In 2014 for example, they privately celebrated the 50th birthday of publishing executive Jon Platt at a Mastro restaurant located in Beverly Hills.\n', '\n', 'Ginsu is a brand of culinary knives owned by conglomerate Berkshire Hathaway. The knives became insanely popular in the U.S. during the 70s and 80s.\n', 'The infomercials for Ginsu birthed the now infamous advertisement catchphrase “but wait, theres more.”'],
            12: ['No analysis on this one from genius :('],
            13: ['No analysis on this one from genius :('],
            14: ['This line is a double entendre: she refers to “finding the one” in the sense of finding a romantic partner and “finding the one,” i.e. identifying the first count of a measure in music.\n', '\n', 'Beyoncé samples underground music artist Moi Renees as the outro of her second part, “HONEY” ─ making the title clear as to why she utilized Januarys 1992 track “Miss Honey”.'],
            15: ['In the opening line, Beyoncé shows her power and dominance. This is not just a reversal of gender roles: Beyoncé wants to do more than provide for her famous spouse JAY-Z, she also wants to house him. Although they both may be known as The Carters, she expresses a desire to be the shelter-provider and to have her last name go first.\n', 'The line could also be a reference to the “houses” in ballroom culture, as this underground subculture gets an homage on this album.\n', 'In the ballroom scene, participants most often belong to a certain “house.” These groups are pretty much chosen families and friends, where they can be fully themselves and at the same time feel safe. These houses are lead by “mothers” or “fathers,” that provide guidance and support. Often, the name of their house is “the house of,” followed by the last name of the alter ego of the mother or father. It is certainly not uncommon for the participants to also take on their last name.\n', 'After they got married in 2008, Beyoncé and JAY-Z got the number “IV” tattooed on their ring fingers. Tattooing your wedding ring is something that has become more common since the 2000s, as a metal ring can often be forgotten or lost.\n', 'For both of them, the number 4 is an important number. They both celebrate their birthday on the 4th day of the month, and therefore decided to get married on April 4 (aka 4/4). Beyoncé has an album named 4, and JAY-Z has one called 4:44. Even their firstborn has a nod to the number 4, as in her name – Blue Ivy – you can find the roman numerals of the same number.\n', 'Shortly after the birth of their twins in 2017, Beyoncé slightly changed the tattoo on her ring finger. Though no worries, the “4” is still visible, only not in roman numerals anymore. Now there are four lines, probably representing their three children, and because theres a slight bend on the fourth line (which makes it look like a “J”), that one will probably represent her husband, JAY-Z.\n', '\n', 'The chorus interpolates renowned American artist Donna Summers classic 1977 space-disco single “I Feel Love,” a collaboration with Pete Bellotte and Giorgio Moroder. The track is one of Summers staples, having peaked at #6 on the Billboard Hot 100 in 1977 and even having been crowned “one of the most influential records ever made” for the club and disco scene.\n', 'Summer has clearly had a resting impact on Beyoncés artistry for a while – in 2003, she also interpolated one of Summers other most popular tracks, “Love to Love You Baby” (1977) in her track “Naughty Girl.”\n', 'To top it off, Summer gave Beyoncé and her work her stamp of approval in 2012 during an interview with EXTRA']
        }

        this.initVis();
    }

    initVis() {
        let vis = this;

        // init margins and height
        vis.margin = globalMargin;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        d3.select("#filterSong")
            .on("change", () => {
                vis.updateVis();
        })


        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {

        let vis = this;

        let selectedValue = d3.select("#filterSong").property("value");


        let lyrics = d3.select("#lyrics-view");
        let desc = d3.select("#song-desc");

        let tmpLyrics = d3.selectAll(".tmpLyric");
        let tmpDesc = d3.selectAll(".tmpDesc");

        let tmpDescDiv = d3.selectAll(".temp-lyrics");

        let tmpSong = d3.selectAll(".song-desc");

        tmpSong.remove();
        tmpDescDiv.remove();


        tmpLyrics.remove();
        tmpDesc.remove();
        


       let newLyrics = vis.data[vis.songRef[selectedValue]]["lyrics"].split("\\n");
       let newDesc = vis.songHighlights[vis.songRef[selectedValue]];


       let newLstring = "";
       let newDescString = "";

       newLyrics.forEach( (i) => {
            newLstring = newLstring + `<p class='tmpLyric'>${i}</p>`;
       })

       newDesc.forEach( (i) => {
            newDescString = newDescString + `<p class='tmpDesc'>${i}</p>`
       })

        tmpLyrics = lyrics
            .append("div")
            .attr("class", "temp-lyrics")

        tmpDesc = desc
            .append("div")
            .attr("class", "song-desc")
        
        tmpLyrics
            .html(newLstring);

        tmpDesc
            .html(newDescString);
    }
}