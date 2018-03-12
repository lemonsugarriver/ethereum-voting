var Voting = artifacts.require("./Voting.sol");


contract('Proposal voting staging', function(accounts) {

  let ownerAccount = accounts[0]
  let notOwnerAccount = accounts[1]
  let participants = accounts.slice(1);

  it("should initilalize in SETUP stage", async () => {
    let instance = await Voting.deployed();
  let state = await instance.getState({from: ownerAccount});
  assert.equal(state.valueOf(), 0, "Contract initialized at SETUP stage.");
})

  it("should set elegible participants to vote proposal", async() => {
    let instance = await Voting.deployed();
  await instance.setParticipants(participants, {from: ownerAccount});
  let actual = await instance.getListParticipants();
  for(i = 0; i < actual.valueOf().length; i++) {
    assert.equal(actual.valueOf()[i], participants[i], "Participants correctly stored in Proposal.")

  }
})

  it("should change SETUP to SIGNUP", async () => {
    let instance = await Voting.deployed();
  let beforestate = await instance.getState();
  assert.equal(beforestate.valueOf(), 0, "SETUP stage.");

  await instance.setStageToSignUp("new question", {from: ownerAccount});

  let afterstate = await instance.getState();
  assert.equal(afterstate.valueOf(), 1, "SIGNUP stage.");
})

  it("should have new question setted as proposal", async () => {
    let instance = await Voting.deployed();
  // Sometimes instance.field() works other doesn't.
  let question = await instance.question();
  assert.equal(question.valueOf(), "new question", "Question was updated in setStageToSignUp()");

})

  it("should register all aproved participants", async () => {
    let instance = await Voting.deployed();
  for (i = 0; i < participants.length; i++) {
    await instance.register({from: participants[i]});
  }
  let numParticipants = await instance.numberOfParticipants();
  let numRegistered = await instance.numberOfRegistered();
  assert.equal(numParticipants.valueOf(),  participants.length, "Number of participants correct.")
  assert.equal(numRegistered.valueOf(),  participants.length, "Number of registred correct.")
  instance.setStageToVote({from: ownerAccount});
  let state = await instance.getState();
  assert.equal(state.valueOf(), 2, "State in vote mode.")
})

  it("should cast vote for each participant", async () => {
    let instance = await Voting.deployed();
  for (i = 0; i < participants.length; i++) {
    await instance.castVote(Math.round(Math.random()), {from: participants[i]});
  }
})

  it("should finish vote state", async() => {
    let instance = await Voting.deployed();
  await instance.closeVoting({from: ownerAccount});
  let state = await instance.getState();
  assert.equal(state.valueOf(), 3, "Vote state has being closed.")
})

  it("should tally result of the proposal", async() => {
    let instance = await Voting.deployed();
  await instance.tallyResult({from: ownerAccount});
})

  it("should get final result of the proposal", async() => {
    let instance = await Voting.deployed();
  let result = await instance.getResult();
  assert.equal(result.valueOf()[0].toNumber() + result.valueOf()[1].toNumber(), 9, "Tally successfully.")
})

});