export type Conversation = { id:string; name:string; phone:string; source:string; initials:string; preview:string; time:string; unread:number; bookmarked:boolean; messages:{ id:string; body:string; time:string; outgoing:boolean }[] };
export const initialConversations: Conversation[] = [
 {id:'1',name:'Macy Johnson',phone:'(818) 429-2763',source:'Practice Fusion',initials:'MJ',preview:'Thanks — I’ll confirm the appointment with him.',time:'3:02 AM',unread:2,bookmarked:true,messages:[{id:'m1',body:'Hi, this is Macy from the Billing Department of Dr. Sunil Rangappa. We spoke yesterday regarding your grandpa’s appointment, which he missed last week. Please call us at 909-671-0123 to reschedule.',time:'Yesterday, 4:42 PM',outgoing:false},{id:'m2',body:'Thank you, Macy. I’ll speak with him and call the office this afternoon.',time:'Yesterday, 4:48 PM',outgoing:true},{id:'m3',body:'Thanks — I’ll confirm the appointment with him.',time:'3:02 AM',outgoing:false}]},
 {id:'2',name:'TriZetto Support',phone:'(888) 698-4554',source:'TriZetto',initials:'TS',preview:'Site ID: 5DJ2 · Your provider solutions one-time code…',time:'3:00 AM',unread:1,bookmarked:false,messages:[{id:'m4',body:'Site ID: 5DJ2 · Your TriZetto Provider Solutions one-time security code is 835021.',time:'3:00 AM',outgoing:false}]},
 {id:'3',name:'Noridian Medicare',phone:'(701) 809-9156',source:'IPS',initials:'NM',preview:'Your six-digit one-time passcode is 095531.',time:'2:27 AM',unread:0,bookmarked:false,messages:[{id:'m5',body:'Your six-digit one-time passcode is 095531. This code expires in 10 minutes.',time:'2:27 AM',outgoing:false}]},
 {id:'4',name:'CMS Verification',phone:'65821',source:'IPS',initials:'CV',preview:'Your verification code is 977460.',time:'2:25 AM',unread:0,bookmarked:true,messages:[{id:'m6',body:'Your verification code is 977460.',time:'2:25 AM',outgoing:false}]},
 {id:'5',name:'One Healthcare ID',phone:'(877) 454-7879',source:'IPS',initials:'OH',preview:'An attempt to sign in was successful.',time:'1:59 AM',unread:0,bookmarked:false,messages:[{id:'m7',body:'An attempt to sign in to your One Healthcare ID was successful.',time:'1:59 AM',outgoing:false}]},
];
export const contacts = [
 ['Macy Johnson','Billing contact','(818) 429-2763','Active'],['Aaron Williams','Patient','(909) 671-0123','Active'],['TriZetto Support','Vendor','(888) 698-4554','Active'],['Diana Patel','Practice manager','(312) 555-0184','Invited'],['Marcus Lee','Patient','(213) 555-0142','Active']
] as const;
export type Contact = { id:string; firstName:string; lastName:string; company:string; title:string; phone:string };
export const initialContacts: Contact[] = [
 {id:'c1',firstName:'',lastName:'',company:'IPS',title:'',phone:'18886216510'},
 {id:'c2',firstName:'',lastName:'',company:'IPS',title:'',phone:'18335926089'},
 {id:'c3',firstName:'Macy',lastName:'Johnson',company:'IPS',title:'Billing contact',phone:'18184292763'},
 {id:'c4',firstName:'',lastName:'',company:'IPS',title:'',phone:'14707727403'},
 {id:'c5',firstName:'',lastName:'',company:'IPS',title:'',phone:'19175887817'},
 {id:'c6',firstName:'',lastName:'',company:'IPS',title:'',phone:'18402009727'},
 {id:'c7',firstName:'Aaron',lastName:'Williams',company:'IPS',title:'Patient',phone:'19096710123'},
 {id:'c8',firstName:'',lastName:'',company:'TriZetto',title:'Support',phone:'18886984554'},
 {id:'c9',firstName:'Diana',lastName:'Patel',company:'IPS',title:'Practice manager',phone:'13125550184'},
 {id:'c10',firstName:'Marcus',lastName:'Lee',company:'IPS',title:'Patient',phone:'12135550142'},
 {id:'c11',firstName:'',lastName:'',company:'IPS',title:'',phone:'18774547879'},
 {id:'c12',firstName:'',lastName:'',company:'IPS',title:'',phone:'17018099156'},
 {id:'c13',firstName:'',lastName:'',company:'IPS',title:'',phone:'18185550111'},
 {id:'c14',firstName:'',lastName:'',company:'IPS',title:'',phone:'13235550222'},
 {id:'c15',firstName:'',lastName:'',company:'IPS',title:'',phone:'14155550333'},
];
