/*
 * Synthetic sample paper for the demo.
 * The paper, authors and references are FICTIONAL and written only to
 * exercise every verification category. They are not real publications.
 */
(function (root) {
  const SAMPLE = {
    title: "Effect of Spaced Repetition Practice on Vocabulary Retention Among Undergraduate Students",
    authors: "A. Sample, B. Example (synthetic demo paper)",
    text: `Effect of Spaced Repetition Practice on Vocabulary Retention Among Undergraduate Students

Abstract
This study examines whether spaced repetition practice improves vocabulary retention among undergraduate students. Students in the spaced group scored significantly higher on the delayed test than students in the massed group. The findings suggest that study scheduling is an important factor in long-term learning.

1. Introduction
Learning new vocabulary is a central task for students in many disciplines. Spaced repetition has been shown to improve long-term retention of vocabulary compared with massed study [1]. Learners using spaced practice retained 40% more words after one month than learners who used massed practice [2]. Mobile flashcard applications prove effective for all learners regardless of prior proficiency [3]. Retrieval practice strengthens memory consolidation more than rereading the same material [4].

2. Background
Sleep between study sessions further increases the retention of newly learned words [5]. Gamified review schedules significantly reduce dropout in online language courses [9]. Prior work found that the timing of feedback affects learning outcomes in classroom settings [6].

3. Methods
Sixty undergraduate students (n = 60) were randomly assigned to a spaced group or a massed group. Both groups studied the same list of 80 English words for a total of 90 minutes. The spaced group studied in three sessions across one week, while the massed group studied in a single session.

4. Results
Students in the spaced group scored significantly higher on the delayed test (mean 78.4%) than the massed group (mean 64.1%, p < 0.01). Immediate test scores did not differ between the two groups. The spaced group also reported higher confidence in recalling word meanings.

5. Discussion
These results are consistent with earlier findings on the spacing effect (Kumar et al., 2021). Spaced practice appears to benefit delayed recall more than immediate recall. Future studies should test larger and more diverse groups of learners.

6. Conclusion
Spaced repetition is a simple scheduling change that can improve long-term vocabulary retention for undergraduate students.

References
[1] Rao, P., & Mehta, S. (2019). Spacing effects in second-language vocabulary learning: a review. Journal of Learning Science, 12(3), 45-60.
[2] Lin, H. (2020). Spaced versus massed practice in vocabulary acquisition. Language Learning Research, 8(1), 101-115.
[3] Deshmukh, A. (2022). Mobile flashcard applications for language learners: a pilot study. Educational Technology Notes, 5(2), 12-20.
[4] Fernandes, R. (2018). Retrieval practice and memory consolidation. Cognitive Studies Quarterly, 21(4), 300-318.
[5] Iyer, K. (2021). Sleep and word learning. Sleep and Cognition, 3(1), 7-19.
[6] Banerjee, T. (2017). Feedback timing in procedural learning tasks. Journal of Applied Cognition, 9(2), 55-70.
[7] Joshi, M. (2016). Vocabulary assessment design. Testing Review, 4(1), 1-10.
[8] Kumar, V., Shah, N., & Pillai, R. (2021). The spacing effect in classroom learning. Educational Psychology Today, 14(2), 88-97.`,
    sources: {
      "1": "This review summarises 14 experiments on second-language learning. Across these experiments, spaced repetition improved long-term retention of vocabulary compared with massed study. The advantage was strongest at delays longer than one week.",
      "2": "We compared spaced and massed practice in 120 adult learners. Learners using spaced practice retained 25% more words after one month than learners who used massed practice. Short-term recall was similar for both groups.",
      "3": "In a small pilot study with 18 participants, mobile flashcard applications may be effective for intermediate learners. Effects for beginner learners were not significant. Further research with larger samples is needed.",
      "4": "Across three experiments, retrieval practice strengthened memory consolidation more than rereading the same material. Students who practised recall remembered more information one week later.",
      "6": "Immediate feedback improved performance on procedural tasks under laboratory conditions. The study did not examine classroom settings or language learning.",
      "8": "Classroom studies show that the spacing effect benefits delayed recall. Students who spread study sessions over several days remembered more material on delayed tests than students who studied in one session.",
    },
  };
  /*
   * Demo source-abstract library used by the "Fill SA" button.
   * Matched to the paper's reference list by first-author surname + year,
   * so it works for the built-in sample and for test-files/test-paper.txt.
   * All entries are synthetic.
   */
  const LIBRARY = [
    // Built-in sample paper (spaced repetition)
    { surname: "Rao", year: "2019", text: SAMPLE.sources["1"] },
    { surname: "Lin", year: "2020", text: SAMPLE.sources["2"] },
    { surname: "Deshmukh", year: "2022", text: SAMPLE.sources["3"] },
    { surname: "Fernandes", year: "2018", text: SAMPLE.sources["4"] },
    { surname: "Banerjee", year: "2017", text: SAMPLE.sources["6"] },
    { surname: "Kumar", year: "2021", text: SAMPLE.sources["8"] },
    // test-files/test-paper.txt (physical activity and sleep)
    { surname: "Sharma", year: "2020", text: "In a review of 18 trials, regular aerobic exercise improved sleep quality in young adults. The improvement was largest when exercise was performed for at least eight weeks." },
    { surname: "Patel", year: "2019", text: "University students who exercised three times per week fell asleep 12 minutes faster than inactive students. Total sleep time was similar between groups." },
    { surname: "Gupta", year: "2021", text: "In this small pilot study of 20 adults, evening exercise may slightly delay sleep onset for some participants. For most participants the effect was not significant." },
    { surname: "Kulkarni", year: "2018", text: "Among 300 university students, screen use before bedtime reduced total sleep duration by an average of 25 minutes per night." },
    { surname: "Fernandes", year: "2017", text: "Mindfulness training improved self-reported sleep in hospital nurses. The study did not include students." },
    { surname: "Nair", year: "2020", text: "Students with more daylight exposure showed earlier and more regular sleep timing." },
  ];
  SAMPLE.library = LIBRARY;

  if (typeof module === "object" && module.exports) module.exports = SAMPLE;
  else root.PEERPROOF_SAMPLE = SAMPLE;
})(typeof self !== "undefined" ? self : this);
