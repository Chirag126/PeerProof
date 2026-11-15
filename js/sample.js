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
  if (typeof module === "object" && module.exports) module.exports = SAMPLE;
  else root.PEERPROOF_SAMPLE = SAMPLE;
})(typeof self !== "undefined" ? self : this);
