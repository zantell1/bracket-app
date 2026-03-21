import type { Picks } from "./bracket-data";

export interface Participant {
  id: string;
  name: string;
  photo: string;
  picks: Picks;
}

export const PARTICIPANTS: Participant[] = [
  {
    id: "adam",
    name: "Adam",
    photo: "/adam.png",
    picks: {
      // SOUTH R64
      s1: "Florida", s2: "Iowa", s3: "Vanderbilt", s4: "Nebraska",
      s5: "North Carolina", s6: "Illinois", s7: "Texas A&M", s8: "Houston",
      // SOUTH R32
      s9: "Florida", s10: "Vanderbilt", s11: "Illinois", s12: "Houston",
      // SOUTH S16 + E8
      s13: "Florida", s14: "Houston", s15: "Houston",
      // EAST R64
      e1: "Duke", e2: "Ohio St", e3: "St John's", e4: "Kansas",
      e5: "South Florida", e6: "Michigan St", e7: "UCLA", e8: "UConn",
      // EAST R32
      e9: "Duke", e10: "St John's", e11: "Michigan St", e12: "UConn",
      // EAST S16 + E8
      e13: "Duke", e14: "Michigan St", e15: "Duke",
      // WEST R64
      w1: "Arizona", w2: "Villanova", w3: "High Point", w4: "Arkansas",
      w5: "Texas", w6: "Gonzaga", w7: "Miami FL", w8: "Purdue",
      // WEST R32
      w9: "Arizona", w10: "Arkansas", w11: "Gonzaga", w12: "Purdue",
      // WEST S16 + E8
      w13: "Arizona", w14: "Gonzaga", w15: "Arizona",
      // MIDWEST R64
      m1: "Michigan", m2: "Georgia", m3: "Texas Tech", m4: "Alabama",
      m5: "Tennessee", m6: "Virginia", m7: "Kentucky", m8: "Iowa State",
      // MIDWEST R32
      m9: "Michigan", m10: "Texas Tech", m11: "Virginia", m12: "Iowa State",
      // MIDWEST S16 + E8
      m13: "Michigan", m14: "Iowa State", m15: "Iowa State",
      // FINAL FOUR + CHAMPIONSHIP
      "ff-east-south": "Duke", "ff-west-midwest": "Arizona", champ: "Arizona",
    },
  },
  {
    id: "harrison",
    name: "Harrison",
    photo: "/harrison.png",
    picks: {
      // SOUTH R64
      s1: "Florida", s2: "Iowa", s3: "Vanderbilt", s4: "Nebraska",
      s5: "North Carolina", s6: "Illinois", s7: "Saint Mary's", s8: "Houston",
      // SOUTH R32
      s9: "Florida", s10: "Vanderbilt", s11: "Illinois", s12: "Houston",
      // SOUTH S16 + E8
      s13: "Florida", s14: "Houston", s15: "Houston",
      // EAST R64
      e1: "Duke", e2: "Ohio St", e3: "St John's", e4: "Kansas",
      e5: "South Florida", e6: "Michigan St", e7: "UCLA", e8: "UConn",
      // EAST R32
      e9: "Duke", e10: "St John's", e11: "Michigan St", e12: "UConn",
      // EAST S16 + E8
      e13: "Duke", e14: "Michigan St", e15: "Michigan St",
      // WEST R64
      w1: "Arizona", w2: "Villanova", w3: "Wisconsin", w4: "Arkansas",
      w5: "Texas", w6: "Gonzaga", w7: "Miami FL", w8: "Purdue",
      // WEST R32
      w9: "Arizona", w10: "Arkansas", w11: "Gonzaga", w12: "Purdue",
      // WEST S16 + E8
      w13: "Arizona", w14: "Gonzaga", w15: "Arizona",
      // MIDWEST R64
      m1: "Michigan", m2: "Georgia", m3: "Texas Tech", m4: "Alabama",
      m5: "Tennessee", m6: "Virginia", m7: "Kentucky", m8: "Iowa State",
      // MIDWEST R32
      m9: "Michigan", m10: "Alabama", m11: "Virginia", m12: "Iowa State",
      // MIDWEST S16 + E8
      m13: "Michigan", m14: "Iowa State", m15: "Michigan",
      // FINAL FOUR + CHAMPIONSHIP
      "ff-east-south": "Michigan St", "ff-west-midwest": "Arizona", champ: "Arizona",
    },
  },
  {
    id: "jacob",
    name: "Jacob",
    photo: "/jacob_.png",
    picks: {
      // SOUTH R64
      s1: "Florida", s2: "Clemson", s3: "Vanderbilt", s4: "Nebraska",
      s5: "North Carolina", s6: "Illinois", s7: "Saint Mary's", s8: "Houston",
      // SOUTH R32
      s9: "Florida", s10: "Vanderbilt", s11: "North Carolina", s12: "Houston",
      // SOUTH S16 + E8
      s13: "Florida", s14: "Houston", s15: "Florida",
      // EAST R64
      e1: "Duke", e2: "Ohio St", e3: "St John's", e4: "Kansas",
      e5: "South Florida", e6: "Michigan St", e7: "UCLA", e8: "UConn",
      // EAST R32
      e9: "Duke", e10: "Kansas", e11: "Michigan St", e12: "UCLA",
      // EAST S16 + E8
      e13: "Duke", e14: "Michigan St", e15: "Duke",
      // WEST R64
      w1: "Arizona", w2: "Villanova", w3: "Wisconsin", w4: "Arkansas",
      w5: "BYU", w6: "Gonzaga", w7: "Miami FL", w8: "Purdue",
      // WEST R32
      w9: "Arizona", w10: "Arkansas", w11: "Gonzaga", w12: "Purdue",
      // WEST S16 + E8
      w13: "Arizona", w14: "Gonzaga", w15: "Arizona",
      // MIDWEST R64
      m1: "Michigan", m2: "Georgia", m3: "Texas Tech", m4: "Alabama",
      m5: "Tennessee", m6: "Wright St", m7: "Santa Clara", m8: "Iowa State",
      // MIDWEST R32
      m9: "Michigan", m10: "Alabama", m11: "Tennessee", m12: "Iowa State",
      // MIDWEST S16 + E8
      m13: "Michigan", m14: "Iowa State", m15: "Michigan",
      // FINAL FOUR + CHAMPIONSHIP
      "ff-east-south": "Duke", "ff-west-midwest": "Arizona", champ: "Duke",
    },
  },
  {
    id: "reid",
    name: "Reid",
    photo: "/reid.png",
    picks: {
      // SOUTH R64
      s1: "Florida", s2: "Iowa", s3: "Vanderbilt", s4: "Nebraska",
      s5: "North Carolina", s6: "Illinois", s7: "Saint Mary's", s8: "Houston",
      // SOUTH R32
      s9: "Florida", s10: "Nebraska", s11: "Illinois", s12: "Houston",
      // SOUTH S16 + E8
      s13: "Florida", s14: "Illinois", s15: "Florida",
      // EAST R64
      e1: "Duke", e2: "Ohio St", e3: "St John's", e4: "Kansas",
      e5: "Louisville", e6: "Michigan St", e7: "UCLA", e8: "UConn",
      // EAST R32
      e9: "Duke", e10: "St John's", e11: "Michigan St", e12: "UConn",
      // EAST S16 + E8
      e13: "Duke", e14: "Michigan St", e15: "Duke",
      // WEST R64
      w1: "Arizona", w2: "Villanova", w3: "Wisconsin", w4: "Arkansas",
      w5: "Texas", w6: "Gonzaga", w7: "Miami FL", w8: "Purdue",
      // WEST R32
      w9: "Arizona", w10: "Arkansas", w11: "Gonzaga", w12: "Purdue",
      // WEST S16 + E8
      w13: "Arkansas", w14: "Gonzaga", w15: "Arkansas",
      // MIDWEST R64
      m1: "Michigan", m2: "Georgia", m3: "Texas Tech", m4: "Alabama",
      m5: "Tennessee", m6: "Virginia", m7: "Santa Clara", m8: "Iowa State",
      // MIDWEST R32
      m9: "Michigan", m10: "Texas Tech", m11: "Virginia", m12: "Iowa State",
      // MIDWEST S16 + E8
      m13: "Michigan", m14: "Iowa State", m15: "Iowa State",
      // FINAL FOUR + CHAMPIONSHIP
      "ff-east-south": "Duke", "ff-west-midwest": "Iowa State", champ: "Florida",
    },
  },
  {
    id: "steven",
    name: "Steven",
    photo: "/steven.png",
    picks: {
      // SOUTH R64
      s1: "Florida", s2: "Clemson", s3: "Vanderbilt", s4: "Nebraska",
      s5: "North Carolina", s6: "Illinois", s7: "Saint Mary's", s8: "Houston",
      // SOUTH R32
      s9: "Florida", s10: "Nebraska", s11: "North Carolina", s12: "Houston",
      // SOUTH S16 + E8
      s13: "Florida", s14: "Houston", s15: "Florida",
      // EAST R64
      e1: "Duke", e2: "Ohio St", e3: "St John's", e4: "Kansas",
      e5: "Louisville", e6: "Michigan St", e7: "UCF", e8: "UConn",
      // EAST R32
      e9: "Duke", e10: "St John's", e11: "Michigan St", e12: "UConn",
      // EAST S16 + E8
      e13: "Duke", e14: "Michigan St", e15: "Michigan St",
      // WEST R64
      w1: "Arizona", w2: "Villanova", w3: "Wisconsin", w4: "Arkansas",
      w5: "BYU", w6: "Gonzaga", w7: "Miami FL", w8: "Purdue",
      // WEST R32
      w9: "Arizona", w10: "Arkansas", w11: "Gonzaga", w12: "Purdue",
      // WEST S16 + E8
      w13: "Arizona", w14: "Gonzaga", w15: "Arizona",
      // MIDWEST R64
      m1: "Michigan", m2: "Georgia", m3: "Texas Tech", m4: "Alabama",
      m5: "Tennessee", m6: "Virginia", m7: "Kentucky", m8: "Iowa State",
      // MIDWEST R32
      m9: "Michigan", m10: "Texas Tech", m11: "Virginia", m12: "Iowa State",
      // MIDWEST S16 + E8
      m13: "Michigan", m14: "Iowa State", m15: "Iowa State",
      // FINAL FOUR + CHAMPIONSHIP
      "ff-east-south": "Michigan St", "ff-west-midwest": "Iowa State", champ: "Michigan St",
    },
  },
  {
    id: "zach",
    name: "Zach",
    photo: "/zach.png",
    picks: {
      // SOUTH R64
      s1: "Florida", s2: "Iowa", s3: "Vanderbilt", s4: "Nebraska",
      s5: "VCU", s6: "Illinois", s7: "Saint Mary's", s8: "Houston",
      // SOUTH R32
      s9: "Florida", s10: "Nebraska", s11: "VCU", s12: "Houston",
      // SOUTH S16 + E8
      s13: "Florida", s14: "Houston", s15: "Florida",
      // EAST R64
      e1: "Duke", e2: "Ohio St", e3: "St John's", e4: "Kansas",
      e5: "Louisville", e6: "Michigan St", e7: "UCLA", e8: "UConn",
      // EAST R32
      e9: "Duke", e10: "St John's", e11: "Michigan St", e12: "UConn",
      // EAST S16 + E8
      e13: "Duke", e14: "Michigan St", e15: "Michigan St",
      // WEST R64
      w1: "Arizona", w2: "Villanova", w3: "Wisconsin", w4: "Arkansas",
      w5: "Texas", w6: "Gonzaga", w7: "Miami FL", w8: "Purdue",
      // WEST R32
      w9: "Arizona", w10: "Arkansas", w11: "Gonzaga", w12: "Purdue",
      // WEST S16 + E8
      w13: "Arizona", w14: "Gonzaga", w15: "Arizona",
      // MIDWEST R64
      m1: "Michigan", m2: "Georgia", m3: "Texas Tech", m4: "Hofstra",
      m5: "Tennessee", m6: "Virginia", m7: "Kentucky", m8: "Iowa State",
      // MIDWEST R32
      m9: "Michigan", m10: "Hofstra", m11: "Virginia", m12: "Iowa State",
      // MIDWEST S16 + E8
      m13: "Michigan", m14: "Iowa State", m15: "Michigan",
      // FINAL FOUR + CHAMPIONSHIP
      "ff-east-south": "Michigan St", "ff-west-midwest": "Arizona", champ: "Florida",
    },
  },
  {
    id: "zack",
    name: "Zack",
    photo: "/zack.png",
    picks: {
      // SOUTH R64
      s1: "Florida", s2: "Iowa", s3: "Vanderbilt", s4: "Nebraska",
      s5: "North Carolina", s6: "Illinois", s7: "Saint Mary's", s8: "Houston",
      // SOUTH R32
      s9: "Florida", s10: "Vanderbilt", s11: "Illinois", s12: "Houston",
      // SOUTH S16 + E8
      s13: "Florida", s14: "Illinois", s15: "Illinois",
      // EAST R64
      e1: "Duke", e2: "Ohio St", e3: "St John's", e4: "Kansas",
      e5: "Louisville", e6: "Michigan St", e7: "UCLA", e8: "UConn",
      // EAST R32
      e9: "Duke", e10: "St John's", e11: "Michigan St", e12: "UConn",
      // EAST S16 + E8
      e13: "St John's", e14: "Michigan St", e15: "St John's",
      // WEST R64
      w1: "Arizona", w2: "Villanova", w3: "Wisconsin", w4: "Arkansas",
      w5: "Texas", w6: "Gonzaga", w7: "Miami FL", w8: "Purdue",
      // WEST R32
      w9: "Arizona", w10: "Arkansas", w11: "Gonzaga", w12: "Purdue",
      // WEST S16 + E8
      w13: "Arizona", w14: "Gonzaga", w15: "Arizona",
      // MIDWEST R64
      m1: "Michigan", m2: "Georgia", m3: "Texas Tech", m4: "Alabama",
      m5: "Tennessee", m6: "Virginia", m7: "Kentucky", m8: "Iowa State",
      // MIDWEST R32
      m9: "Michigan", m10: "Alabama", m11: "Virginia", m12: "Iowa State",
      // MIDWEST S16 + E8
      m13: "Michigan", m14: "Iowa State", m15: "Michigan",
      // FINAL FOUR + CHAMPIONSHIP
      "ff-east-south": "St John's", "ff-west-midwest": "Arizona", champ: "Michigan",
    },
  },
];
