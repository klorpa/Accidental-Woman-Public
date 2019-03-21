/*

███▄▄▄▄      ▄███████▄  ▄████████      ████████▄     ▄████████     ███      ▄█  ███▄▄▄▄      ▄██████▄
███▀▀▀██▄   ███    ███ ███    ███      ███   ▀███   ███    ███ ▀█████████▄ ███  ███▀▀▀██▄   ███    ███
███   ███   ███    ███ ███    █▀       ███    ███   ███    ███    ▀███▀▀██ ███▌ ███   ███   ███    █▀
███   ███   ███    ███ ███             ███    ███   ███    ███     ███   ▀ ███▌ ███   ███  ▄███
███   ███ ▀█████████▀  ███             ███    ███ ▀███████████     ███     ███▌ ███   ███ ▀▀███ ████▄
███   ███   ███        ███    █▄       ███    ███   ███    ███     ███     ███  ███   ███   ███    ███
███   ███   ███        ███    ███      ███   ▄███   ███    ███     ███     ███  ███   ███   ███    ███
 ▀█   █▀   ▄████▀      ████████▀       ████████▀    ███    █▀     ▄████▀   █▀    ▀█   █▀    ████████▀

*/

// NAMESPACE
if (setup.npcDate == null) {
  setup.npcDate = {} as NpcDate;
}

// INTERFACE
interface NpcDate {
  propose: (npcId: string, datePlace: string) => string | boolean;
  checkIfFree: (weekday: number, next: boolean, time: number, datePlace: string, npcId: string) => string | boolean | undefined;
  scheduleDate: (weekday: number, next: boolean, time: number, datePlace: string, npcId: string) => boolean;
  create: (npcId: string) => boolean;
  remove: (npcId: string) => boolean;
  moveToLoc: (npcId: string) => boolean;
  date: (npcId: string, datePlace: string) => boolean;
}

interface datePLaces {
  [propName: string]: [string, string, string | boolean, string];
}

// FUNCTIONS

setup.npcDate.propose = function(npcId) {
  let proposeWeekDay;
  let proposeHours;
  let nextweek = false;
  let output = "";
  if (State.active.variables.date[1] > 6) {
    nextweek = true;
  } else {
    nextweek = false;
  }
  aw.con.info ("nextweek is " + nextweek);
  if (nextweek === true) {
    const futa = random(1, 3);
    if (futa === 1) { // next vacation day
      proposeWeekDay = aw.npc[npcId].sched.workdays.indexOf(false);
      proposeHours = random(11, 21);
    } else { // next working day evening
      proposeWeekDay = aw.npc[npcId].sched.workdays.indexOf(true);
      proposeHours = random((aw.npc[npcId].sched.workhours[1] + 1), 21);
    }
  } else {
    const futa = random(1, 3);
    if (futa === 1) { // next vacation day
      for (let i = 6; i > (State.active.variables.date[1] - 1); i--) {
        if (aw.npc[npcId].sched.workdays[i] === false) {
          proposeWeekDay = i;
          proposeHours = random(11, 21);
        }
      }
    } else { // next working day evening
      for (let i = 6; i > (State.active.variables.date[1] - 1); i--) {
        if (aw.npc[npcId].sched.workdays[i] === true) {
          proposeWeekDay = i;
          proposeHours = random((aw.npc[npcId].sched.workhours[1] + 1), 21);
        }
      }
      if (proposeWeekDay == null) {
        nextweek = true;
        proposeWeekDay = aw.npc[npcId].sched.workdays.indexOf(true);
        proposeHours = random((aw.npc[npcId].sched.workhours[1] + 1), 21);
      }
    }
  }
  if (proposeWeekDay < State.active.variables.date[0] && nextweek === false) {
    nextweek = true;
  }
  const proposePlace = Object.keys(aw.datePlaces)[random(0, 3)];
  const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  output += (nextweek) ? "Maybe next " : "Maybe this ";
  output += `${weekdays[(proposeWeekDay - 1)]}, at ${proposeHours}:00 in the ${aw.datePlaces[proposePlace][3]}?`;
  aw.con.info ("output is " + proposeWeekDay + " " + proposeHours + " " + proposePlace);
  ↂ.sched.npcDate[npcId] = [proposeWeekDay, nextweek, proposeHours, npcId, false, proposePlace];
  return output;
};

setup.npcDate.checkIfFree = function(weekday, next, time, datePlace, npcId) {
  if (aw.npc[npcId] == null) {
    aw.con.warn(`Setup.npcDate.checkIfFree was supplied with npcid ${npcId} which was not found in aw.npc!`);
    return "Sorry, seems like some error happened :(";
  }
  if (next === false) {
    if (weekday > State.active.variables.date[0]) {
      aw.con.info("weekday > State.active.variables.date[0]");
      if (scheduleCheck(weekday, next, time, npcId) === true) {
        setup.npcDate.scheduleDate(weekday, next, time, datePlace, npcId);
        return "Okay, seems fine!";
      } else {
        return scheduleCheck(weekday, next, time, npcId);
      }
    } else if (weekday === State.active.variables.date[0]) {
      if ((time + 1) > State.active.variables.time[0]) {
        aw.con.info("(time+1) > State.active.variables.time[0]");
        if (scheduleCheck(weekday, next, time, npcId) === true) {
          setup.npcDate.scheduleDate(weekday, next, time, datePlace, npcId);
          return "Okay, seems fine!";
        } else {
          return scheduleCheck(weekday, next, time, npcId);
        }
      } else { // Einstein is chasing us armed with his giant timecock. We are doomed.
        aw.con.warn("Date must be scheduled in the future. Retrospective reality changing is prohibited.");
        return "That is the past already, silly!";
      }
    } else if (weekday < State.active.variables.date[0]) { // Oh noes he is doing that again.
      aw.con.warn("Date must be scheduled in the future. Retrospective reality changing is prohibited.");
      return "That is the past already, silly!";
    }
  } else {
    if (scheduleCheck(weekday, next, time, npcId) === true) {
      setup.npcDate.scheduleDate(weekday, next, time, datePlace, npcId);
      return "Okay, seems fine!";
      } else {
        return scheduleCheck(weekday, next, time, npcId);
    }
  }

  function scheduleCheck(weekdayo: number, nexto: boolean, timeo: number, npcIdo: string) {
    aw.con.info("sheduleCheck started with" + weekdayo + " " + timeo + " week " + nexto);
    if (aw.npc[npcIdo].sched.workdays[(weekdayo - 1)]) {
      if (time > aw.npc[npcIdo].sched.workhours[0] && timeo < aw.npc[npcIdo].sched.workhours[1]) {
        aw.con.info("I will be working.");
        return "I will be working.";
      } else {
        aw.con.info("Seems fine");
        return true;
      }
    } else if (timeo > 23) {
      aw.con.info("Player tried to schedule the date later than interface allows. Hmmm.");
      return "It will be too late!";
    } else {
      aw.con.info("Seems fine");
      return true;
    }
  }
  return "Some weird error happened in NPC dating check system :(";
};

setup.npcDate.scheduleDate = function(weekday, next, time, datePlace, npcId) { // Poltergeist!
  const name = `Date - ${aw.npc[npcId].main.name}.`;
  let bliniWeek;
  if (next) {
    bliniWeek = (aw.timeArray[3] + 1);
  } else {
    bliniWeek = aw.timeArray[3];
  }
  aw.con.info(`${weekday}, ${bliniWeek}, ${aw.timeArray[4]}, ${aw.timeArray[5]} and time is ${time}`);
  const helloPapa = (setup.time.dateToVal([weekday, bliniWeek, aw.timeArray[4], aw.timeArray[5]])) + (time * 60);
  setup.sched.new(name, "date", true, helloPapa, false, aw.datePlaces[datePlace][3], datePlace, true, [npcId], `You have arranged a date with ${aw.npc[npcId].main.name} ${aw.npc[npcId].main.surname}. Better don't miss it!`);
  ↂ.sched.npcDate[npcId][4] = true;
  ↂ.sched.npcDate[npcId][5] = datePlace;
  ↂ.flag.schedDates.push(npcId);
  return true;
};

setup.npcDate.create = function(npcId) {
  if (ↂ.flag.schedDates.includes(npcId)) {
    aw.replace("#datescheduler", "<<include [[dateScheduleMenuAlreadySet]]>>");
    return false;
  } else {
    ↂ.sched.npcDate[npcId][3] = npcId;
    aw.replace("#datescheduler", "<<include [[dateScheduleMenu]]>>");
    return true;
  }
};

setup.npcDate.remove = function(npcId) {
  if (npcId == null) {
    aw.con.warn("No argument was supplied for ↂ.flag.schedDates!");
    return false;
  }
  if (ↂ.flag.schedDates.includes(npcId) && ↂ.sched.npcDate !== undefined) {
    ↂ.flag.schedDates.splice((ↂ.flag.schedDates.indexOf(npcId)), 1);
    delete ↂ.sched.npcDate[npcId];
    return true;
  } else {
    aw.con.warn("Date flag not found in the ↂ.flag.schedDates!");
    return false;
  }
};

setup.npcDate.date = function(npcId, datePlace) {
  if (npcId == null) {
    aw.con.warn("no npc id was supplied to setup.npcDate.date");
    return false;
  }
  const ᛔ = State.active.variables;
  const day = ᛔ.date[0] as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const week = ᛔ.date[1];
  if (ↂ.flag.schedDates.includes(npcId)) {
    setup.npcDate.remove(npcId);
    for (let i = 0; i < ↂ.plans.current.length; i++) {
      if (ↂ.plans.current[i].type === "date" && ↂ.plans.current[i].npc[0] === npcId) {
        ↂ.plans.current[i].missed = false;
      }
    }
    /*setup.dialog("Dating", `Wohoo! Don't forget that proper ladies never suck it on the first date. <<comment "This is a placeholder now, but in next releases there will be actual dating :3">><<updatebar>>`);*/
    setup.date.start(npcId);
    return true;
  } else {
    aw.con.warn("Date flag not found in the ↂ.flag.schedDates!");
    return false;
  }
};

Macro.add("datescheduler", {
  handler() {
    if (this.args.length === 0) {
      return this.error("datescheduler Macro requires an npcid.");
    } else if ("string" !== typeof this.args[0]) {
      return this.error("Incorrect data type for datescheduler macro - string expected.");
    }
    const npcId = (setup.npcid.test(this.args[0])) ? this.args[0] : "fail";
    if (npcId === "fail") {
      return this.error(`datescheduler macro requires valid npcid, provided: ${this.args[0]} is not valid.`);
    }
    let output: string;
    if (ↂ.flag.schedDates.includes(npcId)) {
      output = "<<include [[dateScheduleMenuAlreadySet]]>>";
    } else {
      if (ↂ.sched.npcDate[npcId] == null) {
        ↂ.sched.npcDate[npcId] = [0, false, 0, "none", false, "none"];
      }
      ↂ.sched.npcDate[npcId][3] = npcId;
      output = "<<include [[dateScheduleMenu]]>>";
    }
    return new Wikifier(this.output, output);
  },
});

aw.datePlaces = {
  park: ["downtown", "park", false, "Central park"],
  shakenpop: ["downtown", "club", "shakenpopentrance", "Shake & Pop"],
  mall: ["downtown", "mall", false, "Mall"],
  amuse: ["downtown", "amuse", false, "Amusement district"],
};