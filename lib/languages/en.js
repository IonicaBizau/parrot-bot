module.exports = {
    messages: {
        fail: [
            "I don't know to answer this question."
          , "I'm not smart enough yet to answer this."
          , "Can you teach me to answer messages?"
          , "I need a human or a robot to teach me how to answer such messages."
        ]
      , duplicate: {
            "bot": [
                "Soon I will not be able to answer any other questions."
              , "I don't want to say what I already said."
            ],
            "human": [
                "You're repeating yourself.",
              , "You already said this.",
              , "You've already asked me this.",
              , "Don't tell me something you already told me."
            ]
        }
    }
  , meta: {
        ignore: ["is"]
    }
};
