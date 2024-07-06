import { inngest } from "./client";
import OpenAI from "openai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Functions exported from this file are exposed to Inngest
// See: @/app/api/inngest/route.ts

export const messageSent = inngest.createFunction(
  { id: "message-sent" }, // Each function should have a unique ID
  { event: "app/message.sent" }, // When an event by this name received, this function will run

  async ({ event, step, prisma }) => {
    // Fetch data from the database
    const message = await prisma.messages.findUnique({
      where: {
        xata_id: event.data.messageId,
      },
    });

    if (!message) {
      return;
    }

    // You can execute code that interacts with external services
    // All code is retried automatically on failure
    // Read more about Inngest steps: https://www.inngest.com/docs/learn/inngest-steps
    const reply = await step.run("create-reply", async () => {
      if (GEMINI_API_KEY) {
        const chatSession = model.startChat({
          generationConfig,
       // safetySettings: Adjust safety settings
       // See https://ai.google.dev/gemini-api/docs/safety-settings
          history: [
            {
              role: "user",
              parts: [
                {text: "Generate audio diarization, including transcriptions and speaker information for each transcription, for this interview. Organize the transcription by the time they happened."},
              ],
            },
            {
              role: "model",
              parts: [
                {text: "## Audio Diarization: \n\n**0:00-0:12**  Karen: Well, hello everyone. Helpfulness has always been at the heart of Google's mission and so since the outbreak of the COVID-19 pandemic, we wanted to share some of the ways that we've been helping. \n\n**0:12-0:35** Karen: We have launched more than 200 products and features and contributed more than a $billion in resources to help our users, our partners, everyone to get through this pandemic. I want to highlight a few of the areas we've been focused on before we broaden the conversation. You've probably heard the news about Google's collaboration with Apple. We announced this last April and it's a combined effort using Bluetooth technology to help government and health agencies slow the spread of the virus.\n\n**0:35-0:54** Karen: That partnership resulted in exposure notification apps that are used to alert you if you've been in contact with someone who's tested positive for COVID. These apps are available in more than 50 countries and the research is showing that it's helping to save lives. Over the past year, we've been working closely with the World Health Organization, the CDC and others to provide trusted, authoritative information for the public.\n\n**0:54-1:11** Karen: When you search on COVID-19, you'll see official information from these public health entities about symptoms, prevention, treatments and references like maps and graphs to orient you to the state of the pandemic. Last September, we released the COVID-19 Search Trends Symptoms dataset which includes search trends for more than 400 symptoms. \n\n**1:11-1:21** Karen: This data has been helping researchers and public health study the link between symptom related searches and the spread of COVID-19.\n\n**1:21-1:33** Karen: And finally, the Community Mobility reports use the same type of anonymized, aggregated insights we use in products like Google Maps and these reports help chart movement trends over time. We've made them available in 135 countries and 64 languages and they're helping researchers and public health to better understand and forecast the impact of the pandemic on a global stage. \n\n**1:33-1:44** Karen: We know your privacy is essential and our technology allows us to share trends and insights without sharing personal information. \n\n**1:44-1:56** Karen: This is just a bit of what we're doing across Google in response to the pandemic and there's plenty more that we'd like to share. So, I want to open up the conversation. Today, I've invited my colleagues and friends, Dr. Garth Graham and Rob Caliph to talk about our health initiatives in the pandemic that YouTube and another part of the Alphabet company, Verily, have been engaged in. They're two of my favorite people and I hope you enjoy hearing from them this today. \n\n**1:56-2:01** Karen: So, let's start with Garth. Um, what's happening over there with you all at YouTube? How are you getting accurate and up-to-date information to users?\n\n**2:01-2:12** Garth: Thank you, Karen. And, we really have come together across the enterprise to tackle the very serious issues with the pandemic. YouTube, as you know, has become one of the most important sources of information for the public. With 2 billion monthly users, it's really important to sort fact from fiction. \n\n**2:12-2:22** Garth: That's why when the pandemic happened, we moved quickly to update our policies so we could remove false content like claims that COVID is a hoax or things along those lines. In fact, we've removed more than 700,000 videos related to dangerous or misleading COVID-19 medical information. \n\n**2:22-2:35** Garth: We've also gone beyond that. We're partnering with trusted sources in the medical and public health community like the Harvard School of Public Health, the American Public Health Association, the National Academies of Medicine and Mayo Clinic to get the latest information out to users.\n\n**2:35-2:44** Garth: We're putting this authoritative content on COVID-19 information panels that you'll find on the YouTube homepage, on videos and in search results. \n\n**2:44-2:49** Karen: But, would you like to guess how many times these panels have been viewed? \n\n**2:49-2:56** Garth: Over 400 billion times so far. \n\n**2:56-3:01** Karen: That number is amazing every time I hear it. Garth, you have devoted so much of your career to creating parity in health and healthcare and among your many influential roles, you orchestrated the US government's very first national health disparities plan. \n\n**3:01-3:08** Karen: So, I want you to tell us how you're doing work at YouTube that will allow you to connect with audiences that are historically hard to reach, including communities of color. Maybe, you could start with an example of how you've been working with Dr. Fauci?\n\n**3:08-3:21** Garth: That's an area that um, you've pushed us a lot, you know, in terms of making sure we're reaching underserved communities and communities overall. And, we've actually managed to pull off a lot of unlikely peering of bedfellows, um, to use the terminology. And, one of those examples is, we paired Trevor Noah from the Daily Show who has a very popular audience, a very popular voice. And we paired him with Dr. Fauci as a source of science and it worked really well because Trevor asked the tough questions that his fans, his audience, were um, thinking and really got an idea of just how effective these types of interviews can be. The Trevor Noah Fauci interview actually got close to 12 million views. So, we know that these uh personalities um are trusted voices um for um for their communities and um it's really important for YouTube to connect these known personalities with leading health experts to reach people where they are at. And, I really consider this public health 101.\n\n**3:21-3:27** Karen: Yes, indeed. Thank you so much, Garth. That you and your team are doing really important work for the public's health. \n\n**3:27-3:35** Karen: Rob, I'd like to turn to you now so you can tell us about the work that Verily's project baseline has been doing during the pandemic. It's certainly in the beginning and even now, not easy for everyone to get a COVID test and you've partnered with some pretty big names to test millions of people. So, can you tell us more about that?\n\n**3:35-3:48** Rob: Thanks, Karen. It's been great working with you, Garth, and the whole Google Health team. This has really been a tremendous effort. Verily has been able to use the Baseline platform to test millions of people in community testing clinics. And, we've done this across 16 states in partnership with organizations like Rite Aid. \n\n**3:48-3:58** Rob: More than 100,000 people have opted into our COVID-19 research and we've been able to recruit participants for research on therapies and vaccines to address the critical issues about the pandemic. \n\n**3:58-4:06** Karen: Yeah, you know, Rob, you and the team at Verily are often three steps ahead of everybody else and um your testing programs are a good example of that because even as uh you have been developing individual testing, Verily has stepped up to develop reopening strategies. So, can you tell us how that evolved and how you plan to use it in the future?\n\n**4:06-4:19** Rob: Well, Karen, a great byproduct of our work in COVID-19 testing and screening is that we gain valuable insights and data were collected that we used to develop operations and predictive models to help employers and university presidents open their um, institutions.\n\n**4:19-4:29** Rob: Now, we're using those tools to work with these businesses and universities to see if we can help them uh in this next phase of the pandemic as they gradually reopen and deal with vaccination. This is called our Healthier at Work program which now has about 20 customers including several Fortune 500 employers and major universities. \n\n**4:29-4:39** Rob: We've made great progress with this first batch of businesses, their workforces and student forces, and we've got more planned launches coming this year. \n\n**4:39-4:46** Karen: It's great to hear, Rob. When you talk about COVID-19 testing, um, sometimes people hear high sensitivity and pooled testing as kind of some of the characteristics or methods that are important to use. Could you explain in layman's terms what those mean and how they're helping Verily to get more accurate tests and also how to cut costs? \n\n**4:46-4:59** Rob: Sure, let me break it down this way. Pooled testing is simply taking samples like nasal swabs or blood draws from dozens to hundreds of people and only running a single test instead of individual tests. We can then use mathematical algorithms to give us the ability to run many fewer assays and still decipher who is infected out of a group of people. \n\n**4:59-5:08** Rob: High-sensitivity tests are basically more accurate tests which help to reduce the number of false positives. Together, these approaches reduce costs and make better use of supplies. This has all been published in the med archives and is publicly available in blogs.\n\n**5:08-5:16** Karen: Fantastic. Thank you, Rob. And, congratulations to the team. You guys should be really proud.\n\n**5:16-5:26** Karen: So, I want to take a shift and talk about vaccines which is on the top of the mind for just about everybody. Um, Google recently announced an investment of 150 million dollars to promote education and equity in access to vaccines uh for everyone. And, we want to make it easier for people to find vaccine sites on Search and Maps and we're um making our own office spaces available um as vaccination sites across the country and across the world if that's useful.\n\n**5:26-5:36** Karen: So, Rob and Garth um in the topic of vaccines, I want to come back to the both of you so we can hear more about what your teams have been doing uh in regards to vaccinations for the US and the world. Garth, let me start with you. \n\n**5:36-5:52** Garth: Thanks, Karen. And, again, this is an area that you have pushed us on to make sure we're dealing appropriately with issues around equity. And, one of the biggest challenges with the vaccine is getting the word out to underserved communities. And, to do that we're partnering with public health agencies and community-based organizations, including HBCUs like Morehouse School of Medicine and organizations like the CDC Foundation.\n\n**5:52-6:03** Garth: These organizations are helping people and communities, particularly underserved communities, including people of color and people living in rural America, get access to the vaccine in the same way as everyone else and educating folks along the way. I think it's really important to recognize the team effort that you and others as part of the Google Health family have assembled here to really tackle some of these very important issues around equity and helping people find accurate and timely information on vaccines. \n\n**6:03-6:08** Garth: Karen, did you want to share more about that from your end? \n\n**6:08-6:15** Karen: I do. Thank you, Garth. Our team looked at Google Search trends and found that searches for vaccine near me have been increasing by five times since the beginning of the year. \n\n**6:15-6:28** Karen: So, to answer that need we're focusing on making it easier for people to find, when they're eligible to receive a vaccine. To do this, we've expanded information panels on Search to more than 40 countries and we're adding local distribution information in Search and Maps. And, we've just launched the Get The Facts initiative. Get The Facts is all about getting authoritative, evidence-based information out to the world via Google and YouTube.\n\n**6:28-6:37** Karen: And, I'm grateful to partners like VaccineFinder.org and Boston Children's Hospital, government agencies and retail pharmacies who are helping us get the authoritative piece right.\n\n**6:37-6:48** Karen: So, Rob, um Google's technology, specifically AI, is being used for some pretty important steps throughout the supply chain process for vaccines. Um, this includes everything from traffic and weather forecasting um, as well as ensuring safe delivery of the vaccine. Could you give us some more details on that kind of work? \n\n**6:48-6:58** Rob: You bet, Karen. We all know how important logistics are for getting more vaccines into arms. You could say we're obsessed with it now. Google Cloud has developed sophisticated supply chain systems to help states and counties deliver vaccines more efficiently. \n\n**6:58-7:07** Rob: When better supply logistics are coupled with the kind of information you and Garth have described, it's a big help uh in this overwhelming time. \n\n**7:07-7:16** Karen: Thanks, Rob. Um, so, listen, one of the joys of my career um is to work with brilliant people like the both of you and the many people on our teams, and I just want to say how grateful I am that we can contribute our skills, our experience um and other assets of our company to help bring an end to this pandemic.\n\n**7:16-7:35** Karen: I want to thank all of the essential workers on the front lines every day uh those in hospitals, in grocery stores, schools and research labs and many more. We're all in this together and we want you to know that you're on our minds as we do our work. \n"},
              ],
            },
          ],
        });
      
        const result = await chatSession.sendMessage(message?.text);
        // console.log(result.response.text());
        // return result.response.text();
        return result.response.text();
        // const openai = new OpenAI();
        // const completion = await openai.chat.completions.create({
        //   messages: [
        //     {
        //       role: "system",
        //       content:
        //         "You are a helpful assistant. Create a funny reply to my message:",
        //     },
        //     { role: "user", content: message?.text },
        //   ],
        //   model: "gpt-3.5-turbo",
        // });
        // return (
        //   completion.choices[0]?.message.content ?? "Unexpected OpenAI response"
        // );
      } else {
        return "Add OPENAI_API_KEY environment variable to get AI responses.";
      }
    });

    const newMessage = await step.run("add-reply-to-message", async () => {
      return await prisma.messages.create({
        data: { text: reply, author: "AI" },
      });
    });

    return { event, body: `Here's your last message: ${newMessage?.text}!` };
  }
);
