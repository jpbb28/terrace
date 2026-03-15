export type Block =
  | { t: "p"; text: string }
  | { t: "labeled"; name: string; text: string }
  | { t: "divider" };

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: Block[];
};

export const posts: Post[] = [
  {
    slug: "when-do-montreal-terrasses-open",
    title: "When Do Montréal Terrasses Open?",
    description: "The short answer is Victoria Day weekend. The longer answer involves February, earned suffering, and why September is the month nobody talks about.",
    date: "May 1, 2025",
    content: [
      { t: "p", text: "Victoria Day. That's your answer. Third Monday of May, and the city that's been hunching its shoulders against the cold since October suddenly puts chairs outside." },
      { t: "p", text: "It's not gradual. It happens almost overnight. Café owners drag out tables at 7am. By noon, every sidewalk on Saint-Laurent has people sitting on it, still wearing jackets, ordering wine they don't strictly need at that hour. Nobody cares. The season has started." },
      { t: "p", text: "The thing about Montréal terrasse season that people from warmer places don't understand: it means something here. You've earned it. Every February morning when you scraped ice off your windshield at -25, every March when you thought spring was coming and got another foot of snow. That's the bill. The terrasse is how you collect." },
      { t: "p", text: "The season runs longer than you'd think. Heated covered places push well into October. Some technically never close. But the real season is June through September. The season of lingering. Of staying for another drink because why would you go inside." },
      { t: "divider" },
      { t: "labeled", name: "May", text: "The first wave opens around Victoria Day. Hours are conservative at first. Lunch before dinner, dinner before late night. The kitchen is warming up too, in every sense. Bring a layer in the evening. The sun drops and the temperature follows, faster than you expect." },
      { t: "labeled", name: "June", text: "This is the good one. Still cool enough to be comfortable, warm enough to stay. The tourists haven't arrived in force yet. You can get a seat somewhere popular without planning your entire evening around it. The city is in that brief collective exhale after winter. Go now, before everyone else figures it out." },
      { t: "labeled", name: "July–August", text: "Peak. You know it the moment you arrive anywhere near a popular rooftop on a Friday at 7pm. Show up by 5 or go late. Things thin out after 9. Make a reservation like an adult or accept the consequences. The food is good, the drinks are cold, the wait is real." },
      { t: "labeled", name: "September", text: "If you're only going to have one perfect terrasse month in Montréal, this is it. Warm enough during the day, cool in the evenings, and suddenly you can hear yourself think again. The August crowds vanish. The regulars come back. This is when the city stops performing and starts living again." },
      { t: "labeled", name: "October", text: "Wind-down. Heated and covered spots hold on; most sidewalk and rooftop terrasses close somewhere between Thanksgiving and Halloween. Call ahead if you're going somewhere specific. Don't just show up." },
    ],
  },
  {
    slug: "best-rooftop-terrasses-montreal",
    title: "The Best Rooftop Terrasses in Montréal",
    description: "People from Miami don't understand why Montréalers make such a thing about rooftops. They've never survived a February here.",
    date: "May 15, 2025",
    content: [
      { t: "p", text: "People from Miami or Barcelona don't understand why Montréalers make such a thing about rooftop terrasses. They have outdoor drinking 365 days a year. They've been desensitized." },
      { t: "p", text: "We haven't." },
      { t: "p", text: "Six months of winter will do that. You come back to a rooftop in May or June and it hits you in a way that's genuinely difficult to explain to anyone who spent the winter somewhere reasonable. The St. Lawrence out there. The city below you. A cold beer. The feeling that you made it." },
      { t: "p", text: "The rooftop scene here is smaller than the city's overall terrasse culture. Most outdoor drinking in Montréal happens at street level, which is actually how it should be, which is actually better. But there are good options if you know what you're looking for." },
      { t: "divider" },
      { t: "labeled", name: "The hotel rooftops", text: "Old Montréal has a cluster of these. Cocktails, views, the price of a small car. Fine for out-of-town guests or an anniversary. Not what I'm talking about." },
      { t: "labeled", name: "The converted rooftops", text: "Bars and restaurants that took a building top and turned it into something real, with no particular effort to make it look designed. String lights, mismatched furniture, a bar that works. These places tend to have better prices and crowds that actually live here." },
      { t: "labeled", name: "The ones you have to find", text: "A terrace above a Plateau restaurant that doesn't advertise itself. A rooftop in the Latin Quarter that fits maybe forty people and has been there for years without a PR campaign. These are the ones worth the effort. Ask someone who lives in the neighbourhood." },
      { t: "divider" },
      { t: "p", text: "Practical things: arrive earlier than you think necessary. By 7pm on a Friday in July, most good rooftops have a wait. Get there at 5, or make a reservation. Some places take them, some don't. Worth a call." },
      { t: "p", text: "One more thing. It's windier up there than it looks from the street. Every time. Bring something for your shoulders or spend the evening cold and annoyed at yourself. Your choice." },
    ],
  },
  {
    slug: "dog-friendly-terrasses-montreal",
    title: "Dog-Friendly Terrasses in Montréal",
    description: "Montréal has always been a dog city. The terrasse culture has caught up. A practical guide to where you can actually go.",
    date: "June 1, 2025",
    content: [
      { t: "p", text: "Montréal has always been a dog city. Walk any street in the Plateau on a Saturday morning and count. The density is remarkable. People here have dogs the way other cities have cars. A fundamental part of how they move through the world." },
      { t: "p", text: "The terrasse culture has caught up. More places now treat dogs as actual guests rather than things to be managed until someone complains. Water bowl at the door. Staff who stop to say hello before taking your order. You can tell the difference between a place that has a dogs-allowed policy and a place that actually likes dogs." },
      { t: "p", text: "The rule in Québec: dogs can't go inside food establishments. Health regulation, not negotiable. Terrasse spaces are outside, and establishments can allow dogs there as long as they stay out. Most places that welcome dogs have figured out what this looks like in practice. The dog stays outside. That's the deal." },
      { t: "divider" },
      { t: "p", text: "A water bowl near the entrance is a real signal. It means they've thought about this. Low or no barriers are better than high-walled patios where your dog can't see anything and starts climbing the furniture. In July and August, find shade. Pavement heats up fast and dogs overheat faster than you'd think." },
      { t: "p", text: "For neighbourhoods: the Plateau and Mile End are the obvious circuit. Dense, walkable, generally relaxed about dogs. Saint-Henri and Little Burgundy have gotten better as their restaurant scenes have matured. Old Montréal is inconsistent. Some places are genuinely welcoming, others don't want the complication on a busy tourist afternoon. I don't blame them. But I also don't go back." },
      { t: "p", text: "Use the dog-friendly filter on this site. That's what it's there for." },
    ],
  },
  {
    slug: "montreal-terrasses-by-neighbourhood",
    title: "Montréal Terrasses by Neighbourhood",
    description: "Where the terrasse culture actually lives, neighbourhood by neighbourhood. Including the honest version of what each one is like.",
    date: "June 15, 2025",
    content: [
      { t: "p", text: "Montréal's terrasse culture is concentrated. It stacks up in a few places and disperses quickly beyond them. You can waste a lot of time looking for a good terrasse in the wrong neighbourhood. Here's the honest version." },
      { t: "divider" },
      { t: "labeled", name: "Plateau-Mont-Royal", text: "The baseline. More terrasses per block than anywhere else in the city, ranging from classic bistro sidewalk tables to backyard spaces with fire pits. Saint-Laurent, Mont-Royal, Rachel. This is where you take people when they're visiting and want to understand what Montréal outdoor drinking actually looks like. It's also the most crowded, and you can feel it. Both things are true." },
      { t: "labeled", name: "Mile End", text: "Slightly less formal than the Plateau, slightly more interesting. The terrasse scene here is younger and less concerned with what things look like. Natural wine on a wooden bench is more common than tablecloths and a printed menu. Bernard and Saint-Viateur. If you're looking for the Plateau energy but with more room to breathe, this is closer to what you want." },
      { t: "labeled", name: "Old Montréal", text: "Be honest with yourself about what you're doing here. A lot of terrasses in Old Montréal are priced for people who are visiting the city and won't be back for a few years. That's fine. But genuinely good spots exist, mostly on the quieter streets away from Place Jacques-Cartier. The architecture is real. The river is real. Worth it if you pick carefully. Walk into the first terrasse with a view and you're paying for the view." },
      { t: "labeled", name: "Griffintown", text: "Still developing. Some good spots along the canal. Not worth a dedicated trip yet, but if you're already there, there are options. Check back in a few years." },
      { t: "labeled", name: "Saint-Henri and Little Burgundy", text: "Both have developed real restaurant scenes over the past decade, which is recent and worth acknowledging. Less crowded than the Plateau, more neighbourhood feel. The stretch of Notre-Dame Ouest from Atwater heading west is worth walking on a summer evening. Don't tell too many people." },
      { t: "labeled", name: "Verdun", text: "Consistently underrated. Wellington Street has a run of genuinely good terrasses. Honest prices, local crowd, seats available without a fight. The river is close. Go to Verdun." },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
