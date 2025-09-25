//accounts
var accountIndex = 0;
var accountID = 0; //id
var username = ""; //username of user once loged in
var accountPassword = ""; 
var accountDeviceID = "";
var accountStreak = 0;
var accountLastOn = 0;
var accountCompletedWorkout = 0;
var accountPlan = 0;


//opening screen buttons
onEvent("OSloginButton", "click", function( ) {
  setScreen("loginPage");
  checkDeviceForAccount();
  playSound("assets/category_app/perfect_app_button_1.mp3", false);

});
onEvent("OScreateAccountButton", "click", function( ) {
  setScreen("signUpPage");
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
});

//sign up page
onEvent("createAccountButton", "click", function( ) { //creating an account
  var allUsernames = getColumn("accounts", "username");
  
  var validAccount = true;
  var newUsername = getText("newUsernameInput");
  if(newUsername == ""){ //username blank
    validAccount = false;
    setProperty("createAccountOutput", "text", "Please Enter valid Username");
  }
  if(getText("newPasswordInput") != ""){ //password not blank
    if(getText("newPasswordInput")==getText("newPasswordInput2")){
      var password = getText("newPasswordInput");
    }else{
      validAccount = false;
      setProperty("createAccountOutput", "text", "Passwords don't match");
      playSound("assets/category_digital/error_1.mp3", false);
    }
  }else{
     validAccount = false;
    setProperty("createAccountOutput", "text", "Please Enter valid Password");
    playSound("assets/category_digital/error_1.mp3", false);
  }
  
  for(var i = 0;i<allUsernames.length;i++){ //checks if username is taken
    if(newUsername== allUsernames[i]){
      validAccount = false;
      setProperty("createAccountOutput", "text", "Username Already Taken");
      playSound("assets/category_digital/error_1.mp3", false);
    }
  }
  if(validAccount == true){ //they have a new username --> create new account
    createRecord("accounts", {username:newUsername, password:password,deviceID:getUserId(),streak:0,lastOn:getTime(),completedWorkouts:1000000000000000,plan:1}, function(record) {
      setProperty("createAccountOutput", "text", "Success");
      //account created
     logintoAccount(getColumn("accounts", "username").length-1); //log into newest account
    });
  }

}); //create an account
onEvent("SUsignInButton", "click", function( ) {
  setScreen("loginPage");
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
});
onEvent("SUskipButton","click",function(){
    skipLogin();
});

//login page
onEvent("loginButton", "click", function( ) {
  var allUsernames = getColumn("accounts", "username");
  var allPasswords = getColumn("accounts", "password");
  var validLogin = false; //username matches password
  var validUsername = false; //username exists
  var loginAttemptUsername = getText("loginUsernameInput");
  for(var i = 0;i<allUsernames.length;i++){ 
    if(loginAttemptUsername== allUsernames[i]){
      accountIndex = i;
      validUsername = true;
      if(getText("loginPasswordInput")==allPasswords[i]){ //password matches usernames account
        validLogin = true;
       setProperty("loginAccountOutput", "text", "Loading...");
      }else{ //password dosnt match username
        setProperty("loginAccountOutput", "text", "Invalid Password");
        playSound("assets/category_digital/error_1.mp3", false);
        
      }
    }
  }
  
  if(validLogin == false && validUsername == false){  //username dosnt exist
    setProperty("loginAccountOutput", "text", "Login Failed");
    playSound("assets/category_digital/error_1.mp3", false);
  }
  if(validLogin == true){
     logintoAccount(accountIndex);
  }
}); //log into account
onEvent("loginScreenSkipButton", "click", function( ){
  //skip login
  skipLogin();
});
onEvent("loginScreenSignUpButton", "click", function( ) {
  setScreen("signUpPage");
   playSound("assets/category_app/perfect_app_button_1.mp3", false);
});

//gets all the info from data set of account
function logintoAccount(accountIndex){
  accountInfoUpdate();
  tryDeviceUpdate();
  
  setScreen("homeScreen");
  initializeHome();
  updateWorkout();
  noLongerCustom();
  checkStreak();
  updateSubtitleMessage();
  hidePace();
  hideElement("slideLabel"); 
  playSound("assets/category_swish/mechanical_page_transition_movement_swoosh_4.mp3", false);
}

function tryDeviceUpdate(){ //last machine to open account is devicesID
  var currAccountDeviceID = getColumn("accounts", "deviceID")[accountIndex]; 
  if(currAccountDeviceID != getUserId()){
    updateRecord("accounts", {id:accountID, username:username,password:accountPassword,deviceID:getUserId(),streak:accountStreak,lastOn:getTime(),completedWorkouts:accountCompletedWorkout,plan:accountPlan});
    accountInfoUpdate();
  }
}

function updateSubtitleMessage(){
  setText("helloLabel", "Hi, "+ username);
  if(username ==""){
     setText("helloLabel", "Hi!");
  }
  if(accountStreak>1){
    setText("homeSubtitle", "Welcome Back!!");
  }else if(accountStreak>5){
     setText("homeSubtitle", "Wow you are commited!!");
  }else{
    setText("homeSubtitle", "Welcome to Train ME 2!!");
  }
  
}

function accountInfoUpdate(){
  accountID = getColumn("accounts", "id")[accountIndex];
  username = getColumn("accounts", "username")[accountIndex]; 
  accountPassword =  getColumn("accounts", "password")[accountIndex];
  accountDeviceID = getColumn("accounts", "deviceID")[accountIndex];
  accountStreak = getColumn("accounts", "streak")[accountIndex];
  accountLastOn = getColumn("accounts", "lastOn")[accountIndex];
  accountCompletedWorkout = getColumn("accounts", "completedWorkouts")[accountIndex];
  accountPlan = getColumn("accounts", "plan")[accountIndex];
}

//autofil login information based on device
function checkDeviceForAccount(){
  var accountDeviceID = getUserId();
  var allDeviceIDs = getColumn("accounts", "deviceID");
  for(var i = 0;i<allDeviceIDs.length;i++){ 
    if(accountDeviceID == allDeviceIDs[i]){ //autofil login information, returning user
      var allUsernames = getColumn("accounts", "username");
      var allPasswords = getColumn("accounts", "password");
      if(allUsernames[i] != null){
        var filledName = allUsernames[i].toString();
        setText("loginUsernameInput", filledName);
        //console.log(filledName);
      }else{
        //console.log("autofill username error");
      }
      if(allPasswords[i] != null){
        var filledPassword = allPasswords[i].toString();
        setText("loginPasswordInput", filledPassword);
      }else{
        //console.log("autofill password error");
      }
      break; //the first associated account is filled 
    }
  }
}

//create a new account based on device
function skipLogin(){ 
  var newDevice = true;
  var allDeviceIDs = getColumn("accounts", "deviceID");
  var deviceID = 0;
  for(var i = 0;i<allDeviceIDs.length;i++){ 
    if(getUserId() ==allDeviceIDs[i]){ 
      newDevice = false;
      deviceID = i;
      accountIndex  = i;
      break; //first account associated with deviceID
    }
  }
  if(newDevice == true){
    createRecord("accounts", {deviceID:getUserId(),streak:0,lastOn:getTime(),completedWorkouts:1000000000000000,plan:1});
      setProperty("loginAccountOutput", "text", "Success");
      //account made for device (dosnt have username)
      accountIndex  = (getColumn("accounts", "username").length-1);
      deviceID = (getColumn("accounts", "username").length-1);
      logintoAccount(deviceID); //log into newest account
    }else{
    logintoAccount(deviceID);
    }
}

//home screen buttons 
var workoutCategories = ["All Body","Abs","Track","Recovery","Custom"];
var categorieIndex = 1; //indicates which category user is in
var workoutIndex = 9; //indicated which workout user is in..is convered using premadeWorkoutInfo 
var currentWorkoutInfo = []; //current info from list from premadeWorkoutInfo
var premadeWorkoutInfo={
        //All Body
        '0': ['Booty Boost',1,15,6,3,120,'I like big butts and I cannot lie','Single-Leg Glute Bridge','Prison Squat','Side Leg Lift','Lateral Lunge with Reach','Single-Leg Deadlift','Jump Squat'],
        6:['Endurance Training',1,30,7,3,120,'Elevate your heartrate','Should Press x20','One leged Squats x20','Plank Twist x30','Clean and Jerk x10','Winshield Wipers x30','Box Jumps x20','Rope Waves x40'],
        //'-4':['Workout A',40,20,10,2,60,'description','Clap Push Ups X6','Squat Thrusts','Reverse Lunge with Knee Up','Calf Raises','Lunge Jumps','Judo Roll to Jump','Prisioner Squat','Mountain Climbers','Lateral Lunge','Burpee X10'],
        7:['Squat Pyrimid',1,90,6,1,120,'Start Light go Heavy on Squats','Barbell Squats for 10 reps','Barbell Squats for 6 reps','Barbell Squats for 4 reps','Barbell Squats for 2 reps','Barbell Squats for 4 reps','Barbell Squats for 8 reps'],
        8:['Bench Pyrimid',1,90,6,1,120,'Start Light go Heavy on Bench Press','Bench Press for 10 reps','Bench Press for 6 reps','Bench Press for 4 reps','Bench Press for 2 reps','Bench Press for 4 reps','Bench Press for 8 reps'],
        '4':['Back and Bi Day',1,90,6,3,120,'Volume and Size for Back and Biceps','Pull Ups 3x10','Dumbell Press Heavy x10','Lateral Raise x10','Bentover Rows x10','Barbell Curls x10','Concentration Curls x10'],
       
        5:['Classic Arm Day',1,60,6,3,60,'Grow your arms to impress at the beach!','Nuetral Grip Pull Ups x10','Tricep Extentions x10','Barbell Curls x10','Tricep Kick Back x10','Concentration Curls x10','Dips x10'],
        1: ["I'm a Sculpture",30,10,7,2,45,'High Reps to cut fat','Mountain Climbers','Pushups','?','Squats','Lunge','Side Lunge','Dips on edge'],
        2: ['Whole Body Warm Up',30,10,10,1,45,'Bodyweight execises before you run','Jumping Jacks','Standing Squat','Double Leg Butt Kick','Side Lunge','Pogo Jumps','Pushups','Mountain Climbers','Suitcases','Toe Touches','Deadbugs'],
        3:['Essentials',40,10,4,2,60,'Only have a few minutes? Make it 7','Light Squats','Pulls Ups','Situps','Pushups'],
        //abs
        9: ['3 Min Blast',25,5,6,1,0,"This fast paced workout is perfect for scultpitng abs",'Bicycles', 'Dead Bugs','Russian Twist','Sibgle Leg Glute Bridge','Crunch','V-up'],
        10: ['6 Min Burner',20,10,6,2,20,"This fast paced workout is perfect for scultpitng abs",'Mountain Climbers', 'Push Ups','Superman','Leg Raises','Toe Taps','Flutter Kick'],
        11: ['Random Abs',20,10,6,2,45,"Take on random core exercises",'?','?','?','?','?','?'],
        12: ['Classic 10 Min Abs',20,10,6,3,45,"A modern workout for classic abs",'Crunchs','Suitcases','Russian Twists','6 Inches of Fun', 'Leg Raises','Plank Twist' ],
        13: ['Stefs Abs',50,10,10,1,45,"Stefs 10",'Suitcases','Russian Twists','Flutter Kick','Plank', 'Side Plank Left','Side Plank Right','Leg Raises','Crunch','Penguin','Situp'],
        14: ['Elbow Plank Work',22,8,4,2,45,"Target Lower Abs while you elbow plank the whole time",'EP Cross Tuck','EP Single Leg Extention to Tuck','EP Out toe In toe','EP Bear Ball'],
        15: ['Plank Circuit',55,5,7,1,45,"Fuck this",'Shoulder Tap','Plank Up Down','Plank Twist','Left Side Plank', 'Right Side Plank','Plank Leg Raise','Pushups'],
        16: ['Dumbbell Abs',40,10,6,2,45,"Got a Dumbbell, Got a problem",'Weighted Sit Up','Russian Twist','Plank Pull Thru','Renegade Row','Turkish Get Up','Woodchop'],
        17: ['Bells and Whistles Abs',50,20,6,2,45,"Full gym access never hurt this bad",'Ab Wheel','Declined Situp','Captain Chair Leg Raises','Copenhagen Plank','Landmine','Cabel Woodchop'],
        18: ['The Gauntlet',55,5,30,1,45,"Earn the badge, if you dare",'Plank','L-Sit Hold','Crunch',"Leg Lifts", 'Scissor Kicks', 'Side Plank', 'Reverse Crunch', 'Windshield Wiper', 'Toe Taps', 'Bicycles', 'Penguin/Ankle Biters', 'Plank Up Downs', 'Shoulder Taps', 'Flutter Kicks', 'Suitcases', 'Russian Twists', '6 Inches of Fun', 'Leg Raises', 'Plank Twist', 'Hollow Body Hold', 'Dead Bug', 'Mountain Climbers', 'Reverse Crunch/Lying Knee Tucks', 'Plank Hip Dips', 'Superman Hold', 'Bird Dog', 'Starfish Crunch', 'Plank to Dolphin', 'Knee Drives', 'Jackknife Sit-Ups/V-Up'],

        //Track //Speed
        19: ['Vert Farm',30,10,4,3,45,'Improve Vertical Jump','Pogo Jump','Split Jump Lunge','Linear Jump','Single Leg Multi-Directional Hop (AEABDBA)'],
        20: ['Dot Drills',45,15,5,2,30,'Plyo Workout for Quickness','Hop Scotch (RALB - RCLC - RELD then backward)', 'Eights Right Leg (B-C-D-E-C-A-B)','Eights Left Leg (B-C-D-E-C-A-B)','Eights Both Left (B-C-D-E-C-A-B)','Hop Scotch Spin (RALB - RCLC - RELD then Spin)'],
        21: ['Vert Farm Lite',45,10,4,1,1,'Improve Vertical Jump','Pogo Jump','Split Jump Lunge','Squat to Jump','Broad Jumps'],

        //21: ['Ladders',45,15,1,3,30,'Plyo Workout for Quickness','need to add workout'],
        22: ['Accel Sprints',30,30,10,2,60,'Follow Each exercise with a 50m sprint','A-Skip','B-Skip','High Knees','Butt Kicks','Stiff Knee Run','pogo jump','Triple Up High Knee','Triple Up Butt Kick','Lean Foward & Sprint','Jump Forward Jump Back Sprint'],
        23: ['Resistance Runs',60,15,6,2,60,'Partner Up and use a resistance band to pull eachother backward, Switch during long rest','High Knee March','High Knees','Butt Kicks','Side Shuffle','Backward Sprint','Sprint'],
            //require pace time
        24: ['300 Repeats',60,240,6,1,0,'Long Sprints - For 400 runners wanting to kick','300m at 70%','300m at 70%','300m at 70%','300m at 70%','300m at 70%','300m at 70%'],
        25: ['Big Pyrimid',60,120,6,1,120,'simple pyrimid, take extra time to rest','100m at 90%','200m at 75%','400m at 75%','400m at 75%','200m at 75%','100m at 90%'],
        26: ['Sprint Circuit',40,15,2,6,300,'Get ready to be tired','200m at 75%','100m at 90%'],
        //Recovery
        27: ['Yogie',60,5,10,1,120,'Peaceful Mediation','Downward Dog','Warrior II','Triangle Pose','Tree Pose','Bridge Pose','Seated Forward Fold','Cobra','plank','Warrior I','Savasana'],
        28:['Hip Recovery',50,10,5,1,120,'Increase hip mobility and flexibility','Butterfly Stretch','Clams','Mule whips','Fire Hydrant','Child Pose'],
        29:['Leg Recovery',50,10,6,1,120,'Strech those legs','Hamstring Strech','Downward Dog','Pigeon','3 way lateral leg raise','Leg Swing','Leg Drain'],
        30:['Upper Body Mobility',30,10,5,2,30,'Warm up for upper bod','Arm Circle','Shoulder Circle','Chest Opener (hand behind back)','Neck Roll','Child Pose'],
       //30:['Full Body Warm Up',30,10,5,2,30,'Engage all the muscels','Arm Circle','Shoulder Circle','Chest Opener (hand behind back)','Neck Roll','Child Pose'],

        //29:['Barefoot Post',120,2,4,1,120,'Massage foot muscels to reduce cramps','Toe Walk','Heel Walk', 'Sidefoot walk, toes in','Sidefoot walk, toes out'],
        31:['Hurdle Post',60,5,5,1,120,'Set up 6 hurdles in a line to do exercises','Lead left step over','Lead right step over','Lead left sidestep over','Lead right sidestep over','Over/Under into hip stretch']
};
var randomCore= ['Plank','L-Sit Hold','Crunch',"Leg Lifts", 'Scissor Kicks', 'Side Plank', 'Reverse Crunch', 'Windshield Wiper', 'Toe Taps', 'Bicycles', 'Penguin/Ankle Biters', 'Plank Up Downs', 'Shoulder Taps', 'Flutter Kicks', 'Suitcases', 'Russian Twists', '6 Inches of Fun', 'Leg Raises', 'Plank Twist', 'Hollow Body Hold', 'Dead Bug', 'Mountain Climbers', 'Reverse Crunch/Lying Knee Tucks', 'Plank Hip Dips', 'Superman Hold', 'Bird Dog', 'Starfish Crunch', 'Plank to Dolphin', 'Knee Drives', 'Jackknife Sit-Ups/V-Up'];

var numEx = {
  AllBody: 9,
  Abs: 10,
  Track: 8,
  Recovery: 5,
};

//Initalize home screen
function initializeHome(){
  setProperty("workoutTypeLabel", "text", workoutCategories[categorieIndex]);
  updateAccountCompletedWorkout(categorieIndex);
  updateWorkout();
}

function categoryIndexUpdate(){
  updateAccountCompletedWorkout(categorieIndex);
  if(categorieIndex == 0){ //all body
    noLongerCustom();
    workoutIndex=0;
    updateWorkout();
  }else if(categorieIndex ==1){ //abs
    workoutIndex= numEx.AllBody;
    updateWorkout();
  }else if(categorieIndex ==2){//gym
    workoutIndex=numEx.AllBody+numEx.Abs;
    updateWorkout();
  }else if(categorieIndex ==3){  //recovery
    noLongerCustom();
    workoutIndex=numEx.AllBody+numEx.Abs+numEx.Track;
    updateWorkout();
  }else{ //custom
    customCall();
  }
}

//category side buttons
onEvent("newWorkoutTypeRight", "click", function( ) {
  playSound("assets/category_swish/mechanical_page_transition_movement_swoosh_4.mp3", false);
  if(categorieIndex<4){
    categorieIndex+=1;
  }else{
    categorieIndex=0;
  }
  setProperty("workoutTypeLabel", "text", workoutCategories[categorieIndex]);
  setPosition("workoutTypeLabel", 70, 75, 170, 35);
  categoryIndexUpdate();
  easyModeOff();
  hidePace();
});
onEvent("completeLabel", "click", function( ) { //assumed right click
  playSound("assets/category_swish/mechanical_page_transition_movement_swoosh_4.mp3", false);
  if(categorieIndex<4){
    categorieIndex+=1;
  }else{
    categorieIndex=0;
  }
  setProperty("workoutTypeLabel", "text", workoutCategories[categorieIndex]);
  setPosition("workoutTypeLabel", 70, 75, 170, 35);
  categoryIndexUpdate();
  easyModeOff();
  hidePace();
});
onEvent("newWorkoutTypeLeft", "click", function( ) {
  playSound("assets/category_swish/mechanical_page_transition_movement_swoosh_4.mp3", false);
  if(categorieIndex>0){
    categorieIndex-=1;
  }else{
    categorieIndex=4;
  }
  setProperty("workoutTypeLabel", "text", workoutCategories[categorieIndex]);
  setPosition("workoutTypeLabel", 70, 75, 170, 35);
  
  updateAccountCompletedWorkout(categorieIndex);
  if(categorieIndex == 0){ //all body
    noLongerCustom();
    workoutIndex=0;
    updateWorkout();
  }else if(categorieIndex ==1){ //abs
    workoutIndex=numEx.AllBody;
    updateWorkout();
  }else if(categorieIndex ==2){//gym
    workoutIndex=numEx.AllBody+numEx.Abs;
    updateWorkout();
  }else if(categorieIndex ==3){  //recovery
    noLongerCustom();
    workoutIndex=numEx.AllBody+numEx.Abs+numEx.Track;
    updateWorkout();
  }else{ //custom
    customCall();
    hideElement("slideLabel");
  }
  easyModeOff();
  hidePace();
});

function updateAccountCompletedWorkout(categoryIndexPassed){
  var tempNum = 0;
  if(categoryIndexPassed == 0){ //all body 
    tempNum = (parseInt(String(accountCompletedWorkout)[3])+10*parseInt(String(accountCompletedWorkout)[2])+100*parseInt(String(accountCompletedWorkout)[1]));
  }else if(categoryIndexPassed == 1){ //ab
    tempNum = (parseInt(String(accountCompletedWorkout)[6])+10*parseInt(String(accountCompletedWorkout)[5])+100*parseInt(String(accountCompletedWorkout)[4]));
  }else if(categoryIndexPassed == 2){ //gym
    tempNum = (parseInt(String(accountCompletedWorkout)[9])+10*parseInt(String(accountCompletedWorkout)[8])+100*parseInt(String(accountCompletedWorkout)[7]));
  }else if(categoryIndexPassed == 3){ //recov
    tempNum = (parseInt(String(accountCompletedWorkout)[12])+10*parseInt(String(accountCompletedWorkout)[11])+100*parseInt(String(accountCompletedWorkout)[10]));
  }else{ //custom
    tempNum = (parseInt(String(accountCompletedWorkout)[15])+10*parseInt(String(accountCompletedWorkout)[14])+100*parseInt(String(accountCompletedWorkout)[13]));
  }
  setText("completeLabel", "x"+ tempNum);
}

noLongerCustom(); //delete in final

function noLongerCustom(){
    showElement("HSworkoutTitleLabel");
    showElement("workoutDescription");
    showElement("noChangeWorkTimeLabel");
    showElement("technicalWorkTime");
    showElement("noChangeRestTimeLabel");
    showElement("technicalRestTime");
    showElement("noChangeRoundLabel");
    showElement("technicalRounds");
    showElement("noChangeTotalTimeLabel");
    showElement("totalTimeLabel");
    showElement("workoutExerciseList");
    showElement("newWorkoutRight"); 
    showElement("newWorkoutLeft"); 
    showElement("customizeButton"); 
    
    hideElement("customWorkLabel"); 
    hideElement("customWorkTime"); 
    hideElement("customAddWork"); 
    hideElement("customSubtractWork");
    
    hideElement("customRestLabel"); 
    hideElement("customRestTime"); 
    hideElement("customAddRest"); 
    hideElement("customSubtractRest");
    
    hideElement("customExerciseLabel"); 
    hideElement("customExercise"); 
    hideElement("customAddExercise"); 
    hideElement("customSubtractExercise");
    
    hideElement("customRepsLabel"); 
    hideElement("customReps"); 
    hideElement("customAddReps"); 
    hideElement("customSubtractReps");
    
    hideElement("customResetLabel"); 
    hideElement("customReset"); 
    hideElement("customAddReset"); 
    hideElement("customSubtractReset");
    
    hideElement("customTotalTimeLabel"); 
    hideElement("customTotalTime");



}

function customCall(){ //custom WO is called
    intervalWork= 20; 
    intervalRest= 20; 
    intervalExercises= 3;
    intervalRounds= 2;
    intervalReset= 60;
    
    hideElement("HSworkoutTitleLabel");
    hideElement("workoutDescription");
    hideElement("noChangeWorkTimeLabel");
    hideElement("technicalWorkTime");
    hideElement("noChangeRestTimeLabel");
    hideElement("technicalRestTime");
    hideElement("noChangeRoundLabel");
    hideElement("technicalRounds");
    hideElement("noChangeTotalTimeLabel");
    hideElement("totalTimeLabel");
    hideElement("workoutExerciseList"); 
    hideElement("newWorkoutRight"); 
    hideElement("newWorkoutLeft"); 
    hideElement("customizeButton"); 
    
    showElement("customWorkLabel"); 
    showElement("customWorkTime"); 
    showElement("customAddWork"); 
    showElement("customSubtractWork");
    
    showElement("customRestLabel"); 
    showElement("customRestTime"); 
    showElement("customAddRest"); 
    showElement("customSubtractRest");
    
    showElement("customExerciseLabel"); 
    showElement("customExercise"); 
    showElement("customAddExercise"); 
    showElement("customSubtractExercise");
    
    showElement("customRepsLabel"); 
    showElement("customReps"); 
    showElement("customAddReps"); 
    showElement("customSubtractReps");
    
    showElement("customResetLabel"); 
    showElement("customReset"); 
    showElement("customAddReset"); 
    showElement("customSubtractReset");
    
    showElement("customTotalTimeLabel"); 
    showElement("customTotalTime");

  updateCustomItems();
}

function updateCustomItems(){
   setText("customWorkTime", intervalWork);
   setText("customRestTime", intervalRest);
   setText("customExercise", intervalExercises);
   setText("customReps", intervalRounds);
   setText("customReset", intervalReset);
   
   totalLength = (intervalWork*intervalExercises
            *intervalRounds) + (intervalRest
            *intervalRounds*(intervalExercises-1))+
            intervalReset*(intervalRounds-1); //in seconds
   setText("customTotalTime", convertSecToMin(totalLength));
   
}

//workout side buttons
onEvent("newWorkoutRight", "click", function( ) {
  playSound("assets/category_swish/mechanical_page_transition_movement_swoosh_1.mp3", false);
  if(categorieIndex == 0){ //all body
    if(workoutIndex<numEx.AllBody-1){
      workoutIndex+=1;
    }else{
      workoutIndex=0;
    }
  }else if(categorieIndex ==1){ //abs
    if(workoutIndex<numEx.AllBody+numEx.Abs-1){
      workoutIndex+=1;
    }else{
      workoutIndex=numEx.AllBody;
    }
    
  }else if(categorieIndex ==2){//gym
    if(workoutIndex<numEx.AllBody+numEx.Abs+numEx.Track-1){
      workoutIndex+=1;
    }else{
      workoutIndex=numEx.AllBody+numEx.Abs;
    }
  }else if(categorieIndex ==3){  //recovery
    if(workoutIndex<numEx.AllBody+numEx.Abs+numEx.Track+numEx.Recovery-1){
      workoutIndex+=1;
    }else{
      workoutIndex=numEx.AllBody+numEx.Abs+numEx.Track;
    }
  }else{ //custom
    
  }
  easyModeOff();
  updateWorkout();
});
onEvent("newWorkoutLeft", "click", function( ) {
  playSound("assets/category_swish/mechanical_page_transition_movement_swoosh_1.mp3", false);
  if(categorieIndex == 0){ //all body
    if(workoutIndex>0){
      workoutIndex-=1;
    }else{
      workoutIndex=numEx.AllBody-1;
    }
  }else if(categorieIndex ==1){ //abs
    if(workoutIndex>numEx.AllBody){
      workoutIndex-=1;
    }else{
      workoutIndex=numEx.AllBody+numEx.Abs-1;
    }
    
  }else if(categorieIndex ==2){//gym
    if(workoutIndex>numEx.AllBody+numEx.Abs){
      workoutIndex-=1;
    }else{
      workoutIndex=numEx.AllBody+numEx.Abs+numEx.Track-1;
    }
  }else if(categorieIndex ==3){  //recovery
    if(workoutIndex>numEx.AllBody+numEx.Abs+numEx.Track){
      workoutIndex-=1;
    }else{
      workoutIndex=numEx.AllBody+numEx.Abs+numEx.Track+numEx.Recovery-1;
    }
  }else{ //custom
    
  }
  easyModeOff();
  updateWorkout();
});

function hidePace(){
  hideElement("addPace"); 
  hideElement("pace"); 
  hideElement("paceLabel"); 
  hideElement("subtractPace"); 
}


function updateWorkout(){
  currentWorkoutInfo = premadeWorkoutInfo[workoutIndex];
  setText("HSworkoutTitleLabel", currentWorkoutInfo[0]);
   setText("workoutDescription", currentWorkoutInfo[6]);
   var allExerciseList = [];
   for(var i = 7;i<currentWorkoutInfo.length;i++){
     allExerciseList = allExerciseList+(currentWorkoutInfo[i]+'\n');
   }
   setStyle("workoutExerciseList", "max-height:100%; overflow-y:scroll");
    setText("workoutExerciseList", allExerciseList);
   
   intervalWork= currentWorkoutInfo[1]; 
   intervalRest= currentWorkoutInfo[2]; 
   intervalExercises= currentWorkoutInfo[3];
   intervalRounds= currentWorkoutInfo[4];
   intervalReset= currentWorkoutInfo[5];
   totalLength = (intervalWork*intervalExercises
            *intervalRounds) + (intervalRest
            *intervalRounds*(intervalExercises-1))+
            intervalReset*(intervalRounds-1); //in seconds
        
  setText("technicalWorkTime", intervalWork);
  setText("technicalRestTime", intervalRest);
  setText("technicalRounds", intervalRounds);
  setText("totalTimeLabel", convertSecToMin(totalLength));
  if(currentWorkoutInfo[1] == 1){ //is a slide workout
    setText("technicalWorkTime", 'x');
    setText("totalTimeLabel", convertSecToMin(totalLength)+' +Slide');
    showElement("slideLabel"); 
  }else{
    hideElement("slideLabel"); 
  }
  if(workoutIndex==numEx.AllBody+numEx.Abs+6||workoutIndex==numEx.AllBody+numEx.Abs+7||workoutIndex==numEx.AllBody+numEx.Abs+5){
    paceChange();
    showElement("addPace"); 
    showElement("pace"); 
    showElement("paceLabel"); 
    showElement("subtractPace"); 
  }else{
    hidePace();
  }
}
//start button
onEvent("HSstartWorkoutButton", "click", function( ) {
  setScreen("workoutScreen");
  if(categorieIndex !=4){
    updateWorkoutTrackerStart();
    updateWorkout();
  }
  playSound("assets/category_notifications/game_notification_83.mp3", false);
  setUpWorkout();
});



//workoutButtons
onEvent("WOhomeButton", "click", function( ) {
  paused= true;
  timer= 0;
  totalTimer =0;
  targetTime= 0;
  intervalIterator= -1;
  intervalTimesArray = [];
  intervalCatagoryArray = [];
  updateAccountCompletedWorkout(categorieIndex);
  setScreen("homeScreen");
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
});

//variables
  var timer= 0;
  var totalTimer= 0;
  var targetTime= 10;
  var paused= true;
  var intervalIterator= 0;
  var intervalTimesArray= [];
  var intervalCatagoryArray= [];
  var intervalID= 0;
        
  var intervalWork= 5; 
  var intervalRest= 5; 
  var intervalExercises= 3;
  var intervalRounds= 2;
  var intervalReset= 20;
  var totalLength= 0;
  var pace = 60;
  

//playPause button
onEvent("playPauseButton", "click", function( ) {
  playSound("assets/category_app/app_button_1.mp3", false);
  if(paused == false){
    paused= true;
    setText("playPauseButton", "Play");
  }else{
    paused= false;
    setText("playPauseButton", "Pause");
  }
});

function buildIntervalArrays(){
  intervalTimesArray=[];
  intervalCatagoryArray = [];
  targetTimer = 0;
  timer = 0;
  for(var j =0; j < intervalRounds; j++){
            for(var i =0; i < intervalExercises; i++){
                intervalTimesArray.push(intervalWork);
                intervalCatagoryArray.push("w");
                if(i+1 < intervalExercises){ //removes rest before long rest
                    intervalTimesArray.push(intervalRest);
                    intervalCatagoryArray.push("r");
                }
            }
            if(j+1<intervalRounds){ //removes last long rest before completion
                intervalCatagoryArray.push("l");
                intervalTimesArray.push(intervalReset);
            }
            
        }
        intervalTimesArray.push(1);
        intervalCatagoryArray.push("c");
      if(workoutIndex==25){//big pyrimid
        console.log('broken');
        intervalTimesArray = [Math.ceil(pace/4*1.1),120,Math.ceil(pace/2*4/3),120,Math.ceil(pace*4/3),120,Math.ceil(pace*4/3),120,Math.ceil(pace*4/3/2),120,Math.ceil(pace/4*1.1),1];
      }
      if(workoutIndex==26){//short sprint circuit
        console.log('broken');
        intervalTimesArray = [Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),300,Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),300,Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),300,Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),300,Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),300,Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),1];
      }
      if(workoutIndex==24){//300 rep
        console.log('broken');
        intervalTimesArray = [Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),300,Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),300,Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),300,Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),300,Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),300,Math.ceil(pace/2*4/3),15,Math.ceil(pace/4*1.1),1];
      }
      
}

function setUpWorkout(){
  buildIntervalArrays();
  
  timer= 0;
  paused= true;
  targetTime= 0;
  intervalIterator= -1;
  
  setText("nextItemLabel", "Next: "+currentWorkoutInfo[8+intervalIterator]);
  if(categorieIndex==4){ //cusom
      setText("nextItemLabel", "Next: Work");
  }
  setText("WOtimer", timer);
  setText("playPauseButton", "Play");
  setText("WOtitle", "Press Play");
  setProperty("bigBackgroundColor", "background-color", "#30D5C8");
  setProperty("smallBackgroundColor", "background-color", rgb(126, 253, 64));
  
  totalLength = (intervalWork*intervalExercises
            *intervalRounds) + (intervalRest
            *intervalRounds*(intervalExercises-1))+
            intervalReset*(intervalRounds-1); //in seconds
            
            
  setText("remainingTime",convertSecToMin(totalLength));
  showElement("WOtimer");
  setPosition("playPauseButton", 80, 245, 160, 43);
}

function convertSecToMin(sec){
  var minutes = Math.floor(sec/60);
  var seconds = sec%60;
  if(seconds<10){ //single digit
    return(minutes+":0"+seconds);
  }else{
    return(minutes+":"+seconds);
  }
}

onEvent("playPauseButton", "click", function( ) {
  if(paused == false){
    timedLoop(1000, function() { 
      if(paused == false){
          //console.log(timer);
        setText("WOtimer", targetTime-timer);
        setText("remainingTime",convertSecToMin((totalLength-totalTimer)));
        if(targetTime-timer>0){
        }else{ 
          //next exercise
          handleExerciseChange();
        }
        timer = timer + 1;
        totalTimer= totalTimer+1;
        updateWorkoutImage();
      }else{
        stopTimedLoop();
      }
      
    }); 
  }else{
    stopTimedLoop();
  }
});

function handleExerciseChange(){
  timer = 0;
  intervalIterator= intervalIterator+1;
  targetTime = intervalTimesArray[intervalIterator];
  setText("WOtimer", targetTime-timer);
  
  var exerciseNumber = Math.floor((intervalIterator/2)); 
  while(exerciseNumber+1 > intervalExercises){
    exerciseNumber =  exerciseNumber - (intervalExercises);
  }
  
  //small part of screen
  if(intervalCatagoryArray[(intervalIterator+1)] == "r"){
    setText("nextItemLabel", "Next: Rest");
    setProperty("smallBackgroundColor", "background-color", "#fd8e02");
  }else if(intervalCatagoryArray[(intervalIterator+1)] == "w"){
    
   setText("nextItemLabel", "Next: "+currentWorkoutInfo[(exerciseNumber+8)]);
   if(categorieIndex==4){ //cusom
      setText("nextItemLabel", "Next: Work");
    }
    setProperty("smallBackgroundColor", "background-color", rgb(126, 253, 64));
  }else if(intervalCatagoryArray[(intervalIterator+1)] == "l"){
    setText("nextItemLabel", "Next: Long Rest");
    setProperty("smallBackgroundColor", "background-color", "#FFD700");
  }else if(intervalCatagoryArray[(intervalIterator+1)] == "c"){
    setText("nextItemLabel", "Next: Complete");
    setProperty("smallBackgroundColor", "background-color", "#30D5C8");
  }else{
     setText("nextItemLabel", "Next: Complete");
    setProperty("smallBackgroundColor", "background-color", "#30D5C8");
  }
  //big part of screen
  if(intervalCatagoryArray[intervalIterator] == "w"){
    playSound("assets/category_achievements/lighthearted_bonus_objective_5.mp3", false);
    setText("WOtitle", currentWorkoutInfo[(7+exerciseNumber)]);
    setProperty("bigBackgroundColor", "background-color", rgb(126, 253, 64));
    if(currentWorkoutInfo[(7+exerciseNumber)] == '?'){
      var ceilRandom = randomCore.length-1;
      setText("WOtitle", randomCore[randomNumber(1,ceilRandom)]);
      
    }
    if(categorieIndex==4){ //cusom
      setText("WOtitle", "Work");
    }
  }else if(intervalCatagoryArray[intervalIterator] == "r"){
    playSound("assets/category_achievements/lighthearted_bonus_objective_4.mp3", false);
    setText("WOtitle", "Rest");
    setProperty("bigBackgroundColor", "background-color", "#fd8e02");
  }else if(intervalCatagoryArray[intervalIterator] == "l"){
    playSound("assets/category_achievements/lighthearted_bonus_objective_4.mp3", false);
    setText("WOtitle", "Long Rest");
    setProperty("bigBackgroundColor", "background-color", "#FFD700");
    setText("nextItemLabel", "Next: "+currentWorkoutInfo[(7)]);
  }else if(intervalCatagoryArray[intervalIterator] == "c"){
    setText("WOtitle", "Complete");
    paused = true;
    timer = 0;
    setText("WOtimer", 0);
    setProperty("bigBackgroundColor", "background-color", "#30D5C8");
    setText("nextItemLabel", "");
    setProperty("smallBackgroundColor", "background-color", "#30D5C8");
    playSound("assets/category_points/vibrant_affirm_or_open.mp3", false);
    workoutCompleted(categorieIndex);
  }
  if(workoutIndex<=0){//'slide' workout
    if(intervalCatagoryArray[intervalIterator] == "w"){
      paused = true;
      setText("playPauseButton", "Press When Complete");
      setPosition("playPauseButton", 70, 120, 185, 165);
     hideElement("WOtimer");
  }else{
    showElement("WOtimer");
    setPosition("playPauseButton", 80, 245, 160, 43);
    setText("playPauseButton", "Pause");
  }
  }
}

//custom timer 
onEvent("customAddWork", "click", function( ) {
  playSound("assets/category_app/app_button_1.mp3", false);
  intervalWork+=5;
  updateCustomItems();
});
onEvent("customSubtractWork", "click", function( ) {
   
  if(intervalWork>5){
    playSound("assets/category_app/app_button_2.mp3", false);
    intervalWork-=5;
    updateCustomItems();
  }
});
onEvent("customAddRest", "click", function( ) {
  intervalRest+=5;
   playSound("assets/category_app/app_button_1.mp3", false);
  updateCustomItems();
});
onEvent("customSubtractRest", "click", function( ) {
  if(intervalRest>5){
    intervalRest-=5;
    playSound("assets/category_app/app_button_2.mp3", false);
    updateCustomItems();
  }
});
onEvent("customAddExercise", "click", function( ) {
  intervalExercises+=1;
  updateCustomItems();
   playSound("assets/category_app/app_button_1.mp3", false);
});
onEvent("customSubtractExercise", "click", function( ) {
  if(intervalExercises>1){
    playSound("assets/category_app/app_button_2.mp3", false);
    intervalExercises-=1;
    updateCustomItems();
  }
});
onEvent("customAddReps", "click", function( ) {
  intervalRounds+=1;
  playSound("assets/category_app/app_button_1.mp3", false);
  updateCustomItems();
});
onEvent("customSubtractReps", "click", function( ) {
  if(intervalRounds>1){
    playSound("assets/category_app/app_button_2.mp3", false);
    intervalRounds-=1;
    updateCustomItems();
  }
});
onEvent("customAddReset", "click", function( ) {
  intervalReset+=5;
   playSound("assets/category_app/app_button_1.mp3", false);
  updateCustomItems();
});
onEvent("customSubtractReset", "click", function( ) {
  if(intervalReset>5){
    playSound("assets/category_app/app_button_2.mp3", false);
    intervalReset-=5;
    updateCustomItems();
  }
});

onEvent("addPace", "click", function( ) {
    playSound("assets/category_app/app_button_2.mp3", false);
    pace+=1;
    paceChange();
});
onEvent("subtractPace", "click", function( ) {
    if(pace>1){
      playSound("assets/category_app/app_button_2.mp3", false);
      pace-=1;
      paceChange();
    }
});


function logCredentials(){
  console.log("time: "+ getTime()); //milliseconds 
  console.log("accountIndex: "+ accountIndex);
  console.log("username: "+ username);
  console.log("steak: "+ accountStreak);
  console.log("ID: "+ accountID);
  console.log("device: "+ accountDeviceID);
  console.log("CompletedWorkouts: "+ accountCompletedWorkout);
 

readRecords("accounts", {}, function(records) {
  console.log("streak: "+ records[accountIndex].streak);
  
});


}

function updateAccountsTime(){
  //keep everything the same except time
  updateRecord("accounts", {id:accountID, username:username,password:accountPassword,deviceID:accountDeviceID,streak:accountStreak+1,lastOn:getTime(),plan:1()});
}

function checkStreak(){ //called when app is opened
  /*console.log("time: "+getTime());
  console.log("last on: "+accountLastOn);
  console.log("difference ms: " +(getTime()-accountLastOn));
  console.log("difference days: " +((getTime()-accountLastOn)/(1000*60*60*24)));*/

  if(getTime()-accountLastOn > (24*60*60*1000*0.5)){ //been more than 1/2 a day
    if(getTime()-accountLastOn > (24*60*60*1000*2)){ //if more than 2 days.     
      //change current time, streak 1
      updateRecord("accounts", {id:accountID, username:username,password:accountPassword,deviceID:accountDeviceID,streak:1,lastOn:getTime(),completedWorkouts:accountCompletedWorkout,plan:accountPlan});
    }else{     
      //change streak by 1 and last on to current time
      updateRecord("accounts", {id:accountID, username:username,password:accountPassword,deviceID:accountDeviceID,streak:accountStreak+1,lastOn:getTime(),completedWorkouts:accountCompletedWorkout,plan:accountPlan});
    }
    accountInfoUpdate();
  }
  /*console.log("------------");
  console.log("time: "+getTime());
  console.log("last on: "+accountLastOn);
  console.log("difference ms: " +(getTime()-accountLastOn));*/
}

function setUpProfilePage(){
  setScreen("profilePage");
  setText("profileStreakNumber", accountStreak);
  setText("profileWorkoutsNumber", calculateWorkoutNumber(accountCompletedWorkout));
  setText("usernameLabel", username);
   setText("badgeDescription", "Click a badge to learn how to earn it!");
  checkBadges();
}


/* 1 00 00 00 00
    //1 000 000 000 000 000
//gaunt  b   a   g   r   c
  
called when workout is complete, to track completed workouts*/
function workoutCompleted(workoutNumber){
  var power =0;
  if(workoutNumber == 0){ //all body
    power =12;
  }else if(workoutNumber ==1){ //abs
    power =9;
    
  }else if(workoutNumber ==2){//gym
    power =6;
  }else if(workoutNumber ==3){  //recovery
    power =3;
  }else{ //custom
    power =0;
  }
  updateWorkoutTrackerComplete();
  accountCompletedWorkout = accountCompletedWorkout+ (Math.pow(10, power));
  if(workoutIndex == 18 && accountCompletedWorkout < 2000000000000000){ //update gauntlet
      accountCompletedWorkout += 1000000000000000;
  }
  updateRecord("accounts", {id:accountID, username:username,password:accountPassword,deviceID:accountDeviceID,streak:accountStreak,lastOn:accountLastOn,completedWorkouts:accountCompletedWorkout,plan:accountPlan});
}

function calculateWorkoutNumber(account){
  var workoutNumber = 0;
  workoutNumber = workoutNumber+ parseInt(String(account)[15]); //custom 1s place
  workoutNumber = workoutNumber+ 10*parseInt(String(account)[14]);//custom 10s place
  workoutNumber = workoutNumber+ 100*parseInt(String(account)[13]);//custom 100s place

  workoutNumber = workoutNumber+ parseInt(String(account)[12]); //recovery 1s place
  workoutNumber = workoutNumber+ 10*parseInt(String(account)[11]);
  workoutNumber = workoutNumber+ 100*parseInt(String(account)[10]);
  
  workoutNumber = workoutNumber+ parseInt(String(account)[9]); //gym 1s place
  workoutNumber = workoutNumber+ 10*parseInt(String(account)[8]);
  workoutNumber = workoutNumber+ 100*parseInt(String(account)[7]);
  
  workoutNumber = workoutNumber+ parseInt(String(account)[6]); //abs 1s place
  workoutNumber = workoutNumber+ 10*parseInt(String(account)[5]);
  workoutNumber = workoutNumber+ 100*parseInt(String(account)[4]);
  
  workoutNumber = workoutNumber+ parseInt(String(account)[3]); //body 1s place
  workoutNumber = workoutNumber+ 10*parseInt(String(account)[2]);
  workoutNumber = workoutNumber+ 100*parseInt(String(account)[1]);

  return(workoutNumber);
}

//navigation buttons
onEvent("HSprofileButton", "click", function( ) {
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
  setUpProfilePage();
});
onEvent("PPhomeButton", "click", function( ) {
  setScreen("homeScreen");
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
});
onEvent("PPprofileButton", "click", function( ) {
       playSound("assets/category_digital/error_1.mp3", false);
});
onEvent("HShomeButton", "click", function( ) {
       playSound("assets/category_digital/error_1.mp3", false);
});
onEvent("PPtrainerButton", "click", function( ) {
  setScreen("trainerPage");
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
  setupTrainerPage();
});
onEvent("HStrainerButton", "click", function( ) {
  setScreen("trainerPage");
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
  setupTrainerPage();
});
onEvent("TPtrainerButton", "click", function( ) {
  playSound("assets/category_digital/error_1.mp3", false);
});
onEvent("TPprofileButton", "click", function( ) {
  setScreen("profilePage");
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
});
onEvent("TPhomeButton", "click", function( ) {
  setScreen("homeScreen");
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
});
onEvent("leaderboardBackButton", "click", function( ) {
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
  setUpProfilePage();
});
onEvent("aboutHomeButton", "click", function( ) {
  setScreen("homeScreen");
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
});
//infoButton
onEvent("infoButton", "click", function( ) {
  setScreen("aboutPage");
  updateAbout();
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
});

//badges 
var totalBadges = 0;
function checkBadges(){
  totalBadges = 0;
  //Olympian
  if(((parseInt(String(accountCompletedWorkout)[14])>0)||(parseInt(String(accountCompletedWorkout)[15])>0))&&((parseInt(String(accountCompletedWorkout)[11])>0)||(parseInt(String(accountCompletedWorkout)[12])>0))&&((parseInt(String(accountCompletedWorkout)[8])>0)||(parseInt(String(accountCompletedWorkout)[9])>0))&&((parseInt(String(accountCompletedWorkout)[5])>0)||(parseInt(String(accountCompletedWorkout)[6])>0))&&((parseInt(String(accountCompletedWorkout)[4])>0)||(parseInt(String(accountCompletedWorkout)[3])>0))){
    totalBadges+=1;
    setProperty("badge1", "icon-color", '#00ff32');
    setProperty("badge1", "background-color", rgb(89, 173, 3));
    setProperty("badge1Label", "text-color", '#00ff32');
  }
  //Consistent
  if(accountStreak >= 3){
    totalBadges+=1;
    setProperty("badge2", "icon-color", '#00ff32');
    setProperty("badge2", "background-color", rgb(89, 173, 3));
    setProperty("badge2Label", "text-color", '#00ff32');
  }
  //Commited
  if(getProperty("profileWorkoutsNumber", "text") >= 15){
    totalBadges+=1;
    setProperty("badge3", "icon-color", '#00ff32');
    setProperty("badge3", "background-color", rgb(89, 173, 3));
    setProperty("badge3Label", "text-color", '#00ff32');
  }
  //washboard
  if((parseInt(String(accountCompletedWorkout)[4]) > 0 ||(parseInt(String(accountCompletedWorkout)[5]) > 0))){
    totalBadges+=1;
    setProperty("badge4", "icon-color", '#00ff32');
    setProperty("badge4", "background-color", rgb(89, 173, 3));
    setProperty("badge4Label", "text-color", '#00ff32');
  }
  if((parseInt(String(accountCompletedWorkout)[0]) > 1)){ //gauntlet
    totalBadges+=1;
    setProperty("badge5", "icon-color", '#00ff32');
    setProperty("badge5", "background-color", rgb(89, 173, 3));
    setProperty("badge5Label", "text-color", '#00ff32');
  }
  if((parseInt(String(accountCompletedWorkout)[13]) > 0) ||(parseInt(String(accountCompletedWorkout)[14]) > 0)){ //customizer
    totalBadges+=1;
    setProperty("badge6", "icon-color", '#00ff32');
    setProperty("badge6", "background-color", rgb(89, 173, 3));
    setProperty("badge6Label", "text-color", '#00ff32');
  }
  
  
  setText("badgesFraction", totalBadges+"/6"); //total num of badges is 6
}

function checkBadgesCount(i){ //i is the id of account we check for bages
  var tempTotalBadges = 0;
  //Olympian
  var tempAccountCompletedWorkout = (getColumn("accounts", "completedWorkouts")[i]);
  if(((parseInt(String(tempAccountCompletedWorkout)[14])>0)||(parseInt(String(tempAccountCompletedWorkout)[15])>0))&&((parseInt(String(tempAccountCompletedWorkout)[11])>0)||(parseInt(String(tempAccountCompletedWorkout)[12])>0))&&((parseInt(String(tempAccountCompletedWorkout)[8])>0)||(parseInt(String(tempAccountCompletedWorkout)[9])>0))&&((parseInt(String(tempAccountCompletedWorkout)[5])>0)||(parseInt(String(tempAccountCompletedWorkout)[6])>0))&&((parseInt(String(tempAccountCompletedWorkout)[4])>0)||(parseInt(String(tempAccountCompletedWorkout)[3])>0))){
    tempTotalBadges+=1;
  }
  var tempAccountStreak = (getColumn("accounts", "streak")[i]);
  //Consistent
  if(tempAccountStreak >= 3){
    tempTotalBadges+=1;
  }
  //Commited
  if(calculateWorkoutNumber(tempAccountCompletedWorkout) >= 15){
    tempTotalBadges+=1;
  }
  //washboard
  if((parseInt(String(tempAccountCompletedWorkout)[4]) > 0 ||(parseInt(String(tempAccountCompletedWorkout)[5]) > 0))){
    tempTotalBadges+=1;
  }
  //gauntlet
  if((parseInt(String(tempAccountCompletedWorkout)[0]) > 1)){
    tempTotalBadges+=1;
  }
  //customerizer
  if((parseInt(String(tempAccountCompletedWorkout)[13]) > 0) ||(parseInt(String(tempAccountCompletedWorkout)[14]) > 0)){ //customizer
    tempTotalBadges+=1;
  }
  return tempTotalBadges;
}

onEvent("badge1", "click", function( ) {
  setText("badgeDescription", "Complete a workout from every workout category");
});
onEvent("badge2", "click", function( ) {
  setText("badgeDescription", "Reach a streak of 3");
});
onEvent("badge3", "click", function( ) {
  setText("badgeDescription", "Complete 15 workouts");
});
onEvent("badge4", "click", function( ) {
  setText("badgeDescription", "Complete 10 Ab workouts");
});
onEvent("badge5", "click", function( ) {
  setText("badgeDescription", "Complete the Gauntlet, if you dare");
});
onEvent("badge6", "click", function( ) {
  setText("badgeDescription", "Complete 10 Custom workouts");
});

//Trainer
var trainingPlans={
        //BuildStrengh
        1: ['Whole Body Warm Up','Rest','Sprint Circuit','Rest','Essentials','Hip Recovery','Rest','This plan is the perfect way to start building a foundation. We all start somewhere!'],
        2: ['Essentials','Rest','Classic 10 Min Abs','Sprint Circuit','Leg Recovery','3 Min Blast','Rest','This plan builds onto your foundation. Keep Grinding!'],
        3: ['Bench Pyrimid','Squat Pyrimid','Classic 10 Min Abs','Back and Bi Day','Endurance Training','Random Abs','300 Repeats','This plan makes you get huge, You are a beast!'],
        //Increase Speed
        4: ['300 Repeats','Rest','Essentials','Rest','Vert Farm','Leg Recovery','Rest',"Build a base for non-competative running. Each day is a new time to improve"],
        5: ['Big Pyrimid','Accel Sprints','Hurdle Post','Sprint Circuit','Random Abs','Squat Pyrimid','Rest',"Elevate your game for Semicompetative running, keep training!"],
        6: ['Resistance Runs','300 Repeats','Squat Pyrimid','Big Pyrimid','Classic 10 Min Abs','Hip Recovery','Sprint Circuit',"Get speedy with this! Prepare for glory!"],
        //Look Good Feel Good
        7: ["I'm a Sculpture",'Rest','Essentials','Yogie','Rest','Classic 10 Min Abs','Rest','Its time for a change, lets better ourselves together!'],
        8: ["I'm a Sculpture",'Hip Recovery','Classic Arm Day','Yogie','Essentials','Classic 10 Min Abs','Accel Sprints','Continue to work! We can do this!'],
        9: ["I'm a Sculpture",'Yogie','Endurance Training','Classic 10 Min Abs','Bench Pyrimid','300 Repeats','6 Min Burner','You will look sooo good after this, I promise!']
};

onEvent("goalDropDown", "change", function( ) {
  updateSchedule(caclculatePlan());
});
onEvent("scheduleDropdown", "change", function( ) {
  updateSchedule(caclculatePlan());
});

function setupTrainerPage(){
  if(accountPlan<=3){
    setText("goalDropDown", "Build Strength");
  }else if(accountPlan<=6){
    setText("goalDropDown", "Increase Speed");
  }else{
    setText("goalDropDown", "Look Good Feel Good");
  }
  if(accountPlan%3 == 1){
      setText("scheduleDropdown", "3 days - Newcomer");
    }else if(accountPlan%3 == 2){
      setText("scheduleDropdown", "5 days - Average");
    }else{ //3
      setText("scheduleDropdown", "7 days - Advanced");
    }
  if(accountPlan){
    updateSchedule(accountPlan);
  }else{
    updateSchedule(3);
  }
 
 calculateDay();
}

function caclculatePlan(){
  var goalNumber = 0;
  var scheduleNumber=0;
  if(getText("goalDropDown")=='Build Strength'){
    goalNumber=0;
  }else if(getText("goalDropDown")=='Increase Speed'){
    goalNumber=1;
  }else{
    goalNumber=2;
  }
  if(getText("scheduleDropdown")=='3 days - Newcomer'){
    scheduleNumber=1;
  }else if(getText("scheduleDropdown")=='5 days - Average'){
    scheduleNumber=2;
  }else{
    scheduleNumber=3;
  }
  var planNumber = ((goalNumber*3)+scheduleNumber);
  return(planNumber);
}

var currentTrainerInfo = [];

function updateSchedule(planNumber){
  accountPlan = planNumber;
  updateRecord("accounts", {id:accountID, username:username,password:accountPassword,deviceID:accountDeviceID,streak:accountStreak+1,lastOn:getTime(),completedWorkouts:accountCompletedWorkout,plan:accountPlan});
  
  currentTrainerInfo = trainingPlans[planNumber];
  
  if(planNumber){
    loadSchedule();
  }
}
function loadSchedule(){
  setText("mondayExercise", currentTrainerInfo[0]);
  updateImage('mondayImage',currentTrainerInfo[0]);
  setText("tuesdayExercise", currentTrainerInfo[1]);
  updateImage('tuesdayImage',currentTrainerInfo[1]);
  setText("wenesdayExercise", currentTrainerInfo[2]);
  updateImage('wenesdayImage',currentTrainerInfo[2]);
  setText("thursdayExercise", currentTrainerInfo[3]);
  updateImage('thursdayImage',currentTrainerInfo[3]);
  setText("fridayExercise", currentTrainerInfo[4]);
  updateImage('fridayImage',currentTrainerInfo[4]);
  setText("saturdayExercise", currentTrainerInfo[5]);
  updateImage('saturdayImage',currentTrainerInfo[5]);
  setText("sundayExercise", currentTrainerInfo[6]);
  updateImage('sundayImage',currentTrainerInfo[6]);
  setText("planExplanation", currentTrainerInfo[7]);
  setStyle("planExplanation", "max-height:100%; overflow-y:scroll");
}

function updateImage(image,type){
  if(type == 'Rest'){
  setProperty(image, "image", "assets/rest.png");
  }else if(type == 'Yogie'||type =='Hip Recovery'||type =='Leg Recovery'||type =='Barefoot Post'||type =='Hurdle Post'){
    setProperty(image, "image", "assets/actice-rest-icon.png");
  }else if(type == '300 Repeats' ||type == 'Vert Farm'||type == 'Sprint Circuit'|| type == 'Big Pyrimid'){ //Name of specific running workout 
    setProperty(image, "image", "assets/bodyweight-icon.png");
  }else if(type == 'Classic 10 Min Abs'||type == '6 Min Burner'||type == 'Random Abs'||type == '3 Min Blast'||type == 'Dumbbell Abs'){
    setProperty(image, "image", "assets/abs.png");
  }else{
    setProperty(image, "image", "assets/black-weights.png");
  }
  
}

//day indicator
var numericalDate = 0;// 1 = monday, 2 = tuesday etc
function calculateDay(){
  var dateCheck;
  dateCheck = new Date();
  if(String(dateCheck)[0]=='M'){ //monday
    setProperty("dayIndicator", "y", 150); 
    numericalDate = 1;
  }else if(String(dateCheck)[0]=='T'){
    if(String(dateCheck)[1]=='u'){ //tuesday
      setProperty("dayIndicator", "y", 185); 
      numericalDate = 2;
    }else{ //thursday
      setProperty("dayIndicator", "y", 255); 
      numericalDate = 4;
  }
  }else if(String(dateCheck)[0]=='W'){ //wenesday
    setProperty("dayIndicator", "y", 220); 
    numericalDate = 3;
  }else if(String(dateCheck)[0]=='S'){
    if(String(dateCheck)[1]=='a'){ //saturday
      numericalDate = 6;
      setProperty("dayIndicator", "y", 325); 
    }else{ 
      numericalDate = 7;
      setProperty("dayIndicator", "y", 360); //sunday

    }
  }else{ //friday
    setProperty("dayIndicator", "y", 290);
    numericalDate = 5;
  }
}


function updateWorkoutImage(){
  
}

function paceChange(){
  setProperty("pace", "text", pace);
   if(workoutIndex==24){ //300 repeats
     intervalWork = Math.ceil(pace*3/4);
     setProperty("technicalWorkTime", "text", intervalWork);
      totalLength = (intervalWork*intervalExercises
            *intervalRounds) + (intervalRest
            *intervalRounds*(intervalExercises-1))+
            intervalReset*(intervalRounds-1); //in seconds
      setText("totalTimeLabel", convertSecToMin(totalLength));
   }
  if(workoutIndex==25){ //big pyrimid
    setProperty("technicalWorkTime", "text", "x");
    totalLength = 600+ 2*Math.ceil(pace/4*1.1)+2*Math.ceil(pace/2*4/3)+2*Math.ceil(pace*4/3);
    setText("totalTimeLabel", convertSecToMin(totalLength));
  }
  if(workoutIndex==26){ //short sprint circuit
    setProperty("technicalWorkTime", "text", "x");
    totalLength = 1590+6*Math.ceil(pace/4*1.1)+6*Math.ceil(pace/2*4/3);
    setText("totalTimeLabel", convertSecToMin(totalLength));
  }
}

onEvent("SkipWorkoutButton", "click", function( ) {
  if(paused ==false && timer != 1){
    totalTimer = totalTimer - (timer-targetTime+1);
    timer = targetTime-1;
  }
});

var easyModeOn = false; //smiley, easy mode
onEvent("customizeButton", "click", function( ) {
  playSound("assets/category_app/app_button_1.mp3", false);
  if(easyModeOn == false){ 
    easyModeOn = true;
    setProperty("customizeButton", "image", "icon://fa-smile-o");
    setProperty("customizeButton", "icon-color", rgb(126, 253, 64));
    
    intervalWork = Math.floor(intervalWork*3/4);
    intervalRest = Math.ceil(intervalRest*4/3);
    if(intervalRounds>2){ //if its 3 or more
      intervalRounds = intervalRounds-1;
    }
    totalLength = (intervalWork*intervalExercises
            *intervalRounds) + (intervalRest
            *intervalRounds*(intervalExercises-1))+
            intervalReset*(intervalRounds-1); //in seconds
        
  setText("technicalWorkTime", intervalWork);
  setText("technicalRestTime", intervalRest);
  setText("technicalRounds", intervalRounds);
  setText("totalTimeLabel", convertSecToMin(totalLength));
    
  }else{ 
    easyModeOff();
    updateWorkout(); //default settings
  }
  
});

var allExerciseList = [];//['Booty Boost','Endurance Training','Squat Pyrimid','Bench Pyrimid','Back and Bi Day','Classic Arm Day',"I'm a Sculpture",'Speed Circuit','Essentials','10 Min Abs','10 Min Abs 2.0','Random 10 Min Abs','Accel Sprints','Resistance Runs','300 Repeats','Big Pyrimid','Sprint Circuit','Yogie','Hip Recovery','Barefoot Post','Hurdle Post'];
for(var i = 0; i<numEx.AllBody+numEx.Abs+numEx.Track+numEx.Recovery;i++){
  appendItem(allExerciseList, premadeWorkoutInfo[i][0]);
}


function easyModeOff(){
    easyModeOn = false;
    setProperty("customizeButton", "image", "icon://fa-meh-o");
    setProperty("customizeButton", "icon-color", rgb(34, 81, 98));
}

//go button
onEvent("usePlanButton", "click", function( ) {
  currentTrainerInfo = trainingPlans[caclculatePlan()];
  var dailyActivity = currentTrainerInfo[numericalDate-1];
  for(var i = 0;i<allExerciseList.length;i++){
    if(dailyActivity==allExerciseList[i]){
      workoutIndex = i;
      if(workoutIndex <=numEx.AllBody){
        categorieIndex = 0;
      }else if(workoutIndex <=numEx.AllBody+numEx.Abs){
        categorieIndex = 1;
      }else if(workoutIndex <=numEx.AllBody+numEx.Abs+numEx.Track){
        categorieIndex = 2;
      }else{
        categorieIndex = 3;
      }
      setProperty("workoutTypeLabel", "text", workoutCategories[categorieIndex]);
      categoryIndexUpdate();
      workoutIndex = i;
      updateWorkout();
      setScreen("homeScreen");
      playSound("assets/category_swish/mechanical_page_transition_movement_swoosh_4.mp3", false);
    }
  }
  if(dailyActivity == "Rest"){
     playSound("assets/category_digital/error_1.mp3", false);
  }

});


onEvent("leaderboardButton", "click", function( ) {
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
  setScreen("leaderboard");
  calculateLeaderboard();
});

function calculateLeaderboard(){
  var allUsernames = getColumn("accounts", "username");
  //streak
  var allStreak = getColumn("accounts", "streak");
  var currentHighestStreak = 0;
  var currentHighestStreakIndex = 0;
  for(var i = 0;i<allStreak.length;i++){
    if(allStreak[i]>currentHighestStreak){
      currentHighestStreak = allStreak[i];
      currentHighestStreakIndex = i;
    }
  }
  setText("streakHighestUsername", allUsernames[currentHighestStreakIndex]);
  setText("streakHighestNumber", currentHighestStreak);
  //Workouts
  var allWorkoutCodes = getColumn("accounts", "completedWorkouts");
  var allWorkoutNumbers = [];
  for(var i=0;i<allWorkoutCodes.length;i++){
    appendItem(allWorkoutNumbers,(calculateWorkoutNumber(allWorkoutCodes[i])));
  }
  var currentHighestWorkout = 0;
  var currentHighestWorkoutIndex = 0;
  for(var i = 0;i<allWorkoutNumbers.length;i++){
    if(allWorkoutNumbers[i]>currentHighestWorkout){
      currentHighestWorkout = allWorkoutNumbers[i];
      currentHighestWorkoutIndex = i;
    }
  }
  setText("workoutsFirst", allUsernames[currentHighestWorkoutIndex]);
  setText("workoutsFirstNumber", currentHighestWorkout);
  removeItem(allWorkoutNumbers, currentHighestWorkoutIndex);
  removeItem(allUsernames, currentHighestWorkoutIndex);
  currentHighestWorkout = 0;
  currentHighestWorkoutIndex = 0;
  for(var i = 0;i<allWorkoutNumbers.length;i++){
    if(allWorkoutNumbers[i]>currentHighestWorkout){
      currentHighestWorkout = allWorkoutNumbers[i];
      currentHighestWorkoutIndex = i;
    }
  }
  setText("workoutsSecond", allUsernames[currentHighestWorkoutIndex]);
  setText("workoutsSecondNumber", currentHighestWorkout);
  removeItem(allWorkoutNumbers, currentHighestWorkoutIndex);
  removeItem(allUsernames, currentHighestWorkoutIndex);
  currentHighestWorkout = 0;
  currentHighestWorkoutIndex = 0;
  for(var i = 0;i<allWorkoutNumbers.length;i++){
    if(allWorkoutNumbers[i]>currentHighestWorkout){
      currentHighestWorkout = allWorkoutNumbers[i];
      currentHighestWorkoutIndex = i;
    }
  }
  setText("workoutsThird", allUsernames[currentHighestWorkoutIndex]);
  setText("workoutsThirdNumber", currentHighestWorkout);
  setText("youWorkoutsUsernmane", username+" (you)");
  setText("youWorkoutsNumber", calculateWorkoutNumber(accountCompletedWorkout));
}

//search
onEvent("leaderboardSearchButton", "click", function( ) {
  playSound("assets/category_app/perfect_app_button_1.mp3", false);
  var allUsernames = getColumn("accounts", "username");
  var allWorkoutCodes = getColumn("accounts", "completedWorkouts");
  var allStreak = getColumn("accounts", "streak");
  for(var i=0;i<allUsernames.length;i++){
    if(getProperty("leaderboardSearch", "text")==allUsernames[i]){
      setText("searchUsername", allUsernames[i]);
      setText("searchWorkoutNumber", calculateWorkoutNumber(allWorkoutCodes[i]));
      setText("searchProfileStreakNumber", allStreak[i]);
      var badgeCount = checkBadgesCount(i); 
      setText("searchBadgesFraction", badgeCount+"/6");
    }
  }
});

//about page 
var aboutIndex = 0; 
var subTitles = ['Whats new?','Accounts','TRAINer','New Workout Types','Functionality Rewrite','Easy Mode','Skip Button','Improved UI','Audio','Random Exercies','Thank You!'];
var essays = ['Train ME was built around one principle; interval timers. The app didnt have a lot to offer and was fairly basic in many ways. In addition to numerous quality of life changes, improvements on functionality and big fixes, Train ME 2 is build around being an all in one workout companion. With new systems and features that allow users to track progress, set goals and offer a variety of workouts.','One of my favorite new features offered in Train ME 2 is the account system. The goal of which is pretty simple; to track users progress in order to keep them motivated. Accounts track how many workouts from each category a user completes, their streak (how many days they’ve used the app in a row) and their badges. The badges system rewards users for completing various workout goals. By having a tangible way to track workouts the app forces users to come back and continue to work toward their goals. Users can also compete using the leaderboard which shows other top users or they can search for their friends by username to see their progress as well.','One issue I had with Train ME 1 was indecision regarding which workout to do. The TRAINer can take a users goal and experience level and turn it into a workout plan. The app automatically saves your plan and will update daily to give you new workouts. By having a set daily goal, users are more likely to complete a workout and stick to their plan.','Interval workouts are great, but can be fairly repetitive. In Train ME 2, I’ve introduced 2 new types of workouts designed to diversify the users experience. Pace workouts are running based and autocalculate a running speed based on an input. Slide workouts are designed for heavy lifters and allow users to take as much time as they need while completing a set. I’ve also updated past workouts and added new categories including recovery, track and abs. In total Train ME 2 has over 20 premade workouts as well as a customizsable interval timer.','Train ME 1 was built on a loop that runs every millisecond, this made it laggy at times and created glitches such as users clicks not registering, discontinuity between the timer and total timer and lag between switching workouts. In Train ME 2, I’ve build out functionality spralty to make buttons more responsive. The new timing method also allows better conversion for total time and simpler code.','My customer base is split between dedicated athletes and people who workout on occasion. For the ladder group a complaint was how some of the workouts were too strenuous. Since, I’ve added an ‘easy mode’ which takes any workout and makes it easier for those seeking a simpler workout.','At times, when completing a workout a user wants to skip an exercise or bypass the long rest, now using the skip button users can do so.',' Some people found Train ME 1 to be hard to navigate. By creating a home page containing every workout and splitting those into subcategories I hope to have solved this issue.','One of the biggest complaints with Train ME 1 was lack of audio. In Train ME 2, I’ve added audio to every button and most importantly inbetween exercises. It may seem like a small detail but I was amazied at how many people requested this feature.','The most popular workout in Train Me 1 was 10 min abs by a long shot. This one workout was used almost 3 times as every other put together. In Train ME 2, I took the love of ab exercise to a whole new level by adding random core which will generate radom workout solely based around core exercises.','Making this app has been a dream of mine for a very long time. What started as a hobby for me has blossomed into a lifelong passion which I hope to continue long into the future. I’d like to thank my teacher L^2 for mentoring me these past 4 years, Owen for helping me make my app pretty, Stefan for forcing me to take needed breaks, anyone who has listened to me talk about my programing problems, and my parents for allowing me to pursue my dreams. Its been a grind that taken away so much sleep, tears and a bit of my sanity, but I wouldnt trade it for anything.  - Frazier Dougherty '];

onEvent("aboutRight", "click", function( ) {
  if(aboutIndex<10){
    aboutIndex+=1;
  }else{
    aboutIndex = 0;
  }
  updateAbout();
});
onEvent("aboutLeft", "click", function( ) {
  if(aboutIndex>0){
    aboutIndex-=1;
  }else{
    aboutIndex = 10;
  }
  updateAbout();
});


function updateAbout(){
  setText("sublabel1", subTitles[aboutIndex]);
  setText("aboutEssay", essays[aboutIndex]);
}

//Setting workouts in workoutData
/*for(var j =1;j<=31;j++){
  updateRecord("workoutTracker", {id:j,workoutName:premadeWorkoutInfo[j][0],amountRun:0,amountComplete:0}, function(record, success) {
  });
  console.log(j);
  console.log(premadeWorkoutInfo[j][0]);
}*/

function updateWorkoutTrackerStart(){
  var currAmountRun = getColumn("workoutTracker", "amountRun")[workoutIndex-1];
  var currAmountComplete = getColumn("workoutTracker", "amountComplete")[workoutIndex-1];
  updateRecord("workoutTracker", {id:workoutIndex,workoutName:premadeWorkoutInfo[workoutIndex][0],amountRun:currAmountRun+1,amountComplete:currAmountComplete});
}
function updateWorkoutTrackerComplete(){
  var currAmountRun = getColumn("workoutTracker", "amountRun")[workoutIndex-1];
  var currAmountComplete = getColumn("workoutTracker", "amountComplete")[workoutIndex-1];
  updateRecord("workoutTracker", {id:workoutIndex,workoutName:premadeWorkoutInfo[workoutIndex][0],amountRun:currAmountRun,amountComplete:currAmountComplete+1});
}
onEvent("versionButton", "click", function( ) {
  open("https://docs.google.com/document/d/1E8SS_TgsKSuxTIjhOHwp6yLw1mDe3UNwLxFqUJVsTuA/edit?usp=sharing");
});

//log off 5/09/25


  




