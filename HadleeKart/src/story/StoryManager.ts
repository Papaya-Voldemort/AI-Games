// Story Manager for Season One narrative

import { UIManager } from '../ui/UIManager';

interface DialogueChoice {
  text: string;
  callback: () => void;
}

export class StoryManager {
  private uiManager: UIManager;

  constructor() {
    this.uiManager = new UIManager();
  }

  public showIntro(onComplete: () => void): void {
    const dialogues = [
      {
        speaker: 'Luke',
        text: "Another race season... but this one feels different. Hadlee's competing again, and I can't shake this feeling that something's changed between us.",
        choices: [{ text: 'Continue', callback: () => this.showIntroDialogue2(onComplete) }]
      }
    ];

    this.uiManager.showDialogue(
      dialogues[0].speaker,
      dialogues[0].text,
      dialogues[0].choices
    );
  }

  private showIntroDialogue2(onComplete: () => void): void {
    this.uiManager.showDialogue(
      'Hadlee',
      "Hey Luke! Ready to eat my dust again? *laughs* Just kidding... Well, mostly. May the best racer win.",
      [{ text: "Let's race!", callback: onComplete }]
    );
  }

  public showPostRace(trackIndex: number, position: number, onComplete: () => void): void {
    const dialogues = this.getPostRaceDialogue(trackIndex, position);
    
    if (dialogues.length > 0) {
      this.showDialogueSequence(dialogues, 0, onComplete);
    } else {
      onComplete();
    }
  }

  private showDialogueSequence(
    dialogues: Array<{ speaker: string; text: string }>,
    index: number,
    onComplete: () => void
  ): void {
    if (index >= dialogues.length) {
      onComplete();
      return;
    }

    const dialogue = dialogues[index];
    this.uiManager.showDialogue(dialogue.speaker, dialogue.text, [
      {
        text: index < dialogues.length - 1 ? 'Continue' : 'Next Race',
        callback: () => this.showDialogueSequence(dialogues, index + 1, onComplete)
      }
    ]);
  }

  private getPostRaceDialogue(trackIndex: number, position: number): Array<{ speaker: string; text: string }> {
    const won = position <= 3;

    // Track-specific story beats
    switch (trackIndex) {
      case 0: // Sunset Circuit
        return won
          ? [
              { speaker: 'Hadlee', text: "Nice driving out there! You've still got it, Luke." },
              { speaker: 'Luke', text: "Thanks... you too. *There's something in the way she smiled at me just then*" },
              { speaker: 'Harrison', text: "*Scoffs* Beginners luck. Just wait until the real tracks." }
            ]
          : [
              { speaker: 'Harrison', text: "Can't handle the heat, Luke? This is just the warm-up." },
              { speaker: 'Hadlee', text: "Don't listen to him. You'll do better next time." }
            ];

      case 1: // Moonlight Marina
        return won
          ? [
              { speaker: 'Hadlee', text: "The way you handled those puddles... impressive. I've been practicing but you make it look easy." },
              { speaker: 'Luke', text: "I had a good teacher. Remember when you showed me that drift technique?" },
              { speaker: 'Hadlee', text: "*Pauses* Yeah... I remember. We spent the whole night practicing. *Her eyes linger a moment too long*" },
              { speaker: 'Harrison', text: "How touching. Are we racing or reminiscing? Save it for the retirement home." }
            ]
          : [
              { speaker: 'Hadlee', text: "Those puddles got you, huh? Here's a tip: brake early, accelerate through." },
              { speaker: 'Luke', text: "Thanks... wait, are you helping me?" },
              { speaker: 'Hadlee', text: "*Blushes slightly* What? No! I mean... just want a fair race. That's all." }
            ];

      case 2: // Metro Rush
        return won
          ? [
              { speaker: 'Harrison', text: "Luke, we need to talk. Hadlee's... distracted. She's not focused on winning anymore." },
              { speaker: 'Luke', text: "What are you talking about?" },
              { speaker: 'Harrison', text: "Oh come on. The way she looks at you? It's pathetic. And it's slowing her down. Do her a favor and keep your distance." },
              { speaker: 'Luke', text: "*Conflicted* That's... that's not your call to make." }
            ]
          : [
              { speaker: 'Harrison', text: "See? This is what happens when you let feelings cloud judgment." },
              { speaker: 'Hadlee', text: "What's that supposed to mean?" },
              { speaker: 'Harrison', text: "Nothing. Just... stay focused on the championship, Hadlee. Don't let anyone distract you." }
            ];

      case 3: // Forest Trail
        return won
          ? [
              { speaker: 'Hadlee', text: "Can we talk? Away from Harrison?" },
              { speaker: 'Luke', text: "Of course. What's wrong?" },
              { speaker: 'Hadlee', text: "He's been... weird lately. Saying things about us. About how I race differently around you." },
              { speaker: 'Luke', text: "*Heart racing* Do you?" },
              { speaker: 'Hadlee', text: "*Softly* Maybe. Is that... is that a bad thing?" },
              { speaker: 'Luke', text: "*Almost whispers* No. Not at all." }
            ]
          : [
              { speaker: 'Hadlee', text: "Those logs were brutal. You okay?" },
              { speaker: 'Luke', text: "Yeah, just frustrated." },
              { speaker: 'Hadlee', text: "*Touches his arm gently* Hey. You're still in this. We both are." }
            ];

      case 4: // Snowline Pass
        return won
          ? [
              { speaker: 'Harrison', text: "Hadlee, I need you to understand something. Luke's using you." },
              { speaker: 'Hadlee', text: "What? That's ridiculous!" },
              { speaker: 'Harrison', text: "Is it? He knows you have feelings for him. He's playing you to throw you off your game." },
              { speaker: 'Hadlee', text: "*Defensive* You don't know what you're talking about!" },
              { speaker: 'Luke', text: "*Overhearing* Harrison, that's enough!" },
              { speaker: 'Harrison', text: "Truth hurts, doesn't it? Ask yourself, Hadlee - why is he suddenly so interested?" }
            ]
          : [
              { speaker: 'Harrison', text: "See? He's falling apart. This is what I was talking about." },
              { speaker: 'Hadlee', text: "*Quietly to Luke* Don't let him get in your head. I... I believe in you." }
            ];

      case 5: // Crimson Canyon
        return won
          ? [
              { speaker: 'Hadlee', text: "*Shaking* That was terrifying. The wind nearly pushed me off the edge." },
              { speaker: 'Luke', text: "*Without thinking, pulls her into a hug* You're okay. You made it." },
              { speaker: 'Hadlee', text: "*Doesn't pull away* Luke... I need to tell you something." },
              { speaker: 'Luke', text: "*Heart pounding* Yeah?" },
              { speaker: 'Hadlee', text: "After the season... no matter who wins... can we talk? Really talk?" },
              { speaker: 'Luke', text: "I'd like that. More than you know." },
              { speaker: 'Harrison', text: "*Watching from distance, jaw clenched*" }
            ]
          : [
              { speaker: 'Hadlee', text: "That was close. You almost went over the edge!" },
              { speaker: 'Luke', text: "I know. Lost focus for a second." },
              { speaker: 'Hadlee', text: "*Grabs his hands* Stay focused. Please. I need you to... I mean, the competition needs you." }
            ];

      case 6: // Skyline Loop
        return won
          ? [
              { speaker: 'Harrison', text: "*Cornering Hadlee* You're making a mistake. He's not worth it." },
              { speaker: 'Hadlee', text: "That's not your decision to make!" },
              { speaker: 'Harrison', text: "I've been there for you since the beginning! I've helped you, trained with you, and this is how you repay me?" },
              { speaker: 'Hadlee', text: "*Firmly* I never asked you to do any of that expecting something in return. We're friends, Harrison. That's it." },
              { speaker: 'Harrison', text: "*Bitter* Friends. Right. We'll see how you feel after I expose what kind of person Luke really is." },
              { speaker: 'Luke', text: "*Arriving* What's going on here?" },
              { speaker: 'Hadlee', text: "*Upset* Nothing. Harrison was just leaving." }
            ]
          : [
              { speaker: 'Harrison', text: "Falling behind, Luke? Maybe you should stick to what you're good at - which clearly isn't racing." },
              { speaker: 'Hadlee', text: "Harrison! That was uncalled for!" },
              { speaker: 'Harrison', text: "Just stating facts. Some people aren't cut out for the championship circuit." }
            ];

      case 7: // Starlight Finale
        return won
          ? [
              { speaker: 'Luke', text: "We did it. Both of us made it to the finals." },
              { speaker: 'Hadlee', text: "Yeah... listen, about what I said before-" },
              { speaker: 'Luke', text: "I know. I feel it too. I have for a while now." },
              { speaker: 'Hadlee', text: "*Eyes widening* You... you do?" },
              { speaker: 'Luke', text: "*Takes her hands* Hadlee, win or lose this championship, there's something more important I need to say. I-" },
              { speaker: 'Harrison', text: "*Interrupting aggressively* How DARE you! Hadlee deserves better than your manipulation!" },
              { speaker: 'Luke', text: "Harrison, this isn't your-" },
              { speaker: 'Harrison', text: "I've watched you play with her emotions all season! Well I won't let you ruin her!" },
              { speaker: 'Hadlee', text: "*Stepping between them* ENOUGH! Harrison, I appreciate your concern, but this is MY choice!" },
              { speaker: 'Harrison', text: "*Defeated* Fine. But when he breaks your heart, don't come crying to me." },
              { speaker: 'Hadlee', text: "*Turns to Luke* You were saying?" },
              { speaker: 'Luke', text: "*Takes a breath* I love you, Hadlee. Not just as a friend, not just as a racing rival. I'm completely, hopelessly in love with you." },
              { speaker: 'Hadlee', text: "*Tears forming* I love you too, Luke. I think I always have." },
              { speaker: 'Luke', text: "*Pulls her close* Then let's finish this season together. And start something new." },
              { speaker: 'Hadlee', text: "*Smiling through tears* Together. I like the sound of that." }
            ]
          : [
              { speaker: 'Hadlee', text: "Hey... you gave it your all. That's what matters." },
              { speaker: 'Luke', text: "Did I though? I keep getting in my own head." },
              { speaker: 'Hadlee', text: "*Gently* Luke, can I tell you something? Win or lose, you mean more to me than any championship." },
              { speaker: 'Luke', text: "*Surprised* Hadlee..." },
              { speaker: 'Hadlee', text: "I'm saying... maybe there's more to racing than just crossing the finish line first." }
            ];

      default:
        return [];
    }
  }
}
