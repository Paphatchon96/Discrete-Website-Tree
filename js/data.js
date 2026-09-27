/* ========================================================
   data.js — "ถึงไว" Transit Trip Planner
   REAL Bangkok station names & real interchange points:
   BTS Sukhumvit (Mo Chit-Bearing core), BTS Silom (full line),
   MRT Blue Line (Tha Phra-Itsaraphap), and BMTA bus route 15.
   Travel times are demo estimates; fares use the real
   published BTS/MRT station-count fare tables.
   ======================================================== */

const BTS_FARE_TABLE = [17,25,28,32,35,40,43,47]; // 1..8+ stations
const MRT_FARE_TABLE = [17,20,22,25,27,30,32,35,37,40,42,45]; // 1..12+ stations
const BUS_FLAT_FARE = 10; // ordinary BMTA bus, flat fare

function fareForGroup(mode, hopCount) {
  if (mode === "BTS") return BTS_FARE_TABLE[Math.min(hopCount, BTS_FARE_TABLE.length) - 1];
  if (mode === "MRT") return MRT_FARE_TABLE[Math.min(hopCount, MRT_FARE_TABLE.length) - 1];
  if (mode === "เปลี่ยนสาย") return 0;
  return BUS_FLAT_FARE; // any bus line: one flat fare per boarding
}

/* -------------------------------------------------
   1) TREE — station picker (Root -> type -> line -> station)
   ------------------------------------------------- */
const STATION_TREE = {
  "id": "root",
  "name": "ทุกระบบขนส่ง",
  "children": [
    {
      "id": "rail",
      "name": "รถไฟฟ้า (BTS / MRT)",
      "children": [
        {
          "id": "sukhumvit",
          "name": "สาย สุขุมวิท (BTS)",
          "children": [
            {
              "id": "n0",
              "name": "หมอชิต"
            },
            {
              "id": "n1",
              "name": "สะพานควาย"
            },
            {
              "id": "n2",
              "name": "อารีย์"
            },
            {
              "id": "n3",
              "name": "สนามเป้า"
            },
            {
              "id": "n4",
              "name": "อนุสาวรีย์ชัยสมรภูมิ"
            },
            {
              "id": "n5",
              "name": "พญาไท"
            },
            {
              "id": "n6",
              "name": "ราชเทวี"
            },
            {
              "id": "n7",
              "name": "สยาม"
            },
            {
              "id": "n8",
              "name": "ชิดลม"
            },
            {
              "id": "n9",
              "name": "นานา"
            },
            {
              "id": "n10",
              "name": "อโศก"
            },
            {
              "id": "n11",
              "name": "พร้อมพงษ์"
            },
            {
              "id": "n12",
              "name": "ทองหล่อ"
            },
            {
              "id": "n13",
              "name": "เอกมัย"
            },
            {
              "id": "n14",
              "name": "พระโขนง"
            },
            {
              "id": "n15",
              "name": "อ่อนนุช"
            },
            {
              "id": "n16",
              "name": "บางจาก"
            },
            {
              "id": "n17",
              "name": "ปุณณวิถี"
            },
            {
              "id": "n18",
              "name": "อุดมสุข"
            },
            {
              "id": "n19",
              "name": "บางนา"
            },
            {
              "id": "n20",
              "name": "แบริ่ง"
            }
          ]
        },
        {
          "id": "silom",
          "name": "สาย สีลม (BTS)",
          "children": [
            {
              "id": "n21",
              "name": "สนามกีฬาแห่งชาติ"
            },
            {
              "id": "n22",
              "name": "ราชดำริ"
            },
            {
              "id": "n23",
              "name": "ศาลาแดง"
            },
            {
              "id": "n24",
              "name": "ช่องนนทรี"
            },
            {
              "id": "n25",
              "name": "เซนต์หลุยส์"
            },
            {
              "id": "n26",
              "name": "สุรศักดิ์"
            },
            {
              "id": "n27",
              "name": "สะพานตากสิน"
            },
            {
              "id": "n28",
              "name": "กรุงธนบุรี"
            },
            {
              "id": "n29",
              "name": "วงเวียนใหญ่"
            },
            {
              "id": "n30",
              "name": "โพธิ์นิมิตร"
            },
            {
              "id": "n31",
              "name": "ตลาดพลู"
            },
            {
              "id": "n32",
              "name": "วุฒากาศ"
            },
            {
              "id": "n33",
              "name": "บางหว้า"
            }
          ]
        },
        {
          "id": "blue",
          "name": "สาย สีน้ำเงิน (MRT)",
          "children": [
            {
              "id": "n34",
              "name": "ท่าพระ"
            },
            {
              "id": "n35",
              "name": "จรัญฯ 13"
            },
            {
              "id": "n36",
              "name": "ไฟฉาย"
            },
            {
              "id": "n37",
              "name": "บางขุนนท์"
            },
            {
              "id": "n38",
              "name": "บางยี่ขัน"
            },
            {
              "id": "n39",
              "name": "สิรินธร"
            },
            {
              "id": "n40",
              "name": "บางพลัด"
            },
            {
              "id": "n41",
              "name": "บางอ้อ"
            },
            {
              "id": "n42",
              "name": "บางโพ"
            },
            {
              "id": "n43",
              "name": "เตาปูน"
            },
            {
              "id": "n44",
              "name": "บางซื่อ"
            },
            {
              "id": "n45",
              "name": "กำแพงเพชร"
            },
            {
              "id": "n46",
              "name": "สวนจตุจักร"
            },
            {
              "id": "n47",
              "name": "พหลโยธิน"
            },
            {
              "id": "n48",
              "name": "ลาดพร้าว"
            },
            {
              "id": "n49",
              "name": "รัชดาภิเษก"
            },
            {
              "id": "n50",
              "name": "สุทธิสาร"
            },
            {
              "id": "n51",
              "name": "ห้วยขวาง"
            },
            {
              "id": "n52",
              "name": "ศูนย์วัฒนธรรมแห่งประเทศไทย"
            },
            {
              "id": "n53",
              "name": "พระราม 9"
            },
            {
              "id": "n54",
              "name": "เพชรบุรี"
            },
            {
              "id": "n55",
              "name": "สุขุมวิท"
            },
            {
              "id": "n56",
              "name": "ศูนย์การประชุมแห่งชาติสิริกิติ์"
            },
            {
              "id": "n57",
              "name": "คลองเตย"
            },
            {
              "id": "n58",
              "name": "ลุมพินี"
            },
            {
              "id": "n59",
              "name": "สีลม"
            },
            {
              "id": "n60",
              "name": "สามย่าน"
            },
            {
              "id": "n61",
              "name": "หัวลำโพง"
            },
            {
              "id": "n62",
              "name": "วัดมังกร"
            },
            {
              "id": "n63",
              "name": "สามยอด"
            },
            {
              "id": "n64",
              "name": "สนามไชย"
            },
            {
              "id": "n65",
              "name": "อิสรภาพ"
            }
          ]
        }
      ]
    },
    {
      "id": "bus",
      "name": "รถเมล์",
      "children": [
        {
          "id": "line15",
          "name": "สาย 15",
          "children": [
            {
              "id": "n66",
              "name": "ประตูน้ำ"
            },
            {
              "id": "n67",
              "name": "สนามหลวง"
            },
            {
              "id": "n68",
              "name": "ท่าช้าง"
            }
          ]
        }
      ]
    }
  ]
};

/* -------------------------------------------------
   2) WEIGHTED GRAPH — Vertex = สถานี, Edge = ช่วงทาง
   69 vertices, 71 edges (all real Bangkok stations)
   ------------------------------------------------- */
const TRANSIT_GRAPH = {
  "หมอชิต": [
    {
      "to": "สะพานควาย",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "สวนจตุจักร",
      "time": 6,
      "mode": "เปลี่ยนสาย"
    }
  ],
  "สะพานควาย": [
    {
      "to": "หมอชิต",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "อารีย์",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "อารีย์": [
    {
      "to": "สะพานควาย",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "สนามเป้า",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "สนามเป้า": [
    {
      "to": "อารีย์",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "อนุสาวรีย์ชัยสมรภูมิ",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "อนุสาวรีย์ชัยสมรภูมิ": [
    {
      "to": "สนามเป้า",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "พญาไท",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "ประตูน้ำ",
      "time": 12,
      "mode": "รถเมล์ สาย 15"
    }
  ],
  "พญาไท": [
    {
      "to": "อนุสาวรีย์ชัยสมรภูมิ",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "ราชเทวี",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "ราชเทวี": [
    {
      "to": "พญาไท",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "สยาม",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "สยาม": [
    {
      "to": "ราชเทวี",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "ชิดลม",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "สนามกีฬาแห่งชาติ",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "ราชดำริ",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "ชิดลม": [
    {
      "to": "สยาม",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "นานา",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "นานา": [
    {
      "to": "ชิดลม",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "อโศก",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "อโศก": [
    {
      "to": "นานา",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "พร้อมพงษ์",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "สุขุมวิท",
      "time": 6,
      "mode": "เปลี่ยนสาย"
    }
  ],
  "พร้อมพงษ์": [
    {
      "to": "อโศก",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "ทองหล่อ",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "ทองหล่อ": [
    {
      "to": "พร้อมพงษ์",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "เอกมัย",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "เอกมัย": [
    {
      "to": "ทองหล่อ",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "พระโขนง",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "พระโขนง": [
    {
      "to": "เอกมัย",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "อ่อนนุช",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "อ่อนนุช": [
    {
      "to": "พระโขนง",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "บางจาก",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "บางจาก": [
    {
      "to": "อ่อนนุช",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "ปุณณวิถี",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "ปุณณวิถี": [
    {
      "to": "บางจาก",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "อุดมสุข",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "อุดมสุข": [
    {
      "to": "ปุณณวิถี",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "บางนา",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "บางนา": [
    {
      "to": "อุดมสุข",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "แบริ่ง",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "แบริ่ง": [
    {
      "to": "บางนา",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "สนามกีฬาแห่งชาติ": [
    {
      "to": "สยาม",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "ราชดำริ": [
    {
      "to": "สยาม",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "ศาลาแดง",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "ประตูน้ำ",
      "time": 8,
      "mode": "รถเมล์ สาย 15"
    },
    {
      "to": "สนามหลวง",
      "time": 20,
      "mode": "รถเมล์ สาย 15"
    }
  ],
  "ศาลาแดง": [
    {
      "to": "ราชดำริ",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "ช่องนนทรี",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "สีลม",
      "time": 6,
      "mode": "เปลี่ยนสาย"
    }
  ],
  "ช่องนนทรี": [
    {
      "to": "ศาลาแดง",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "เซนต์หลุยส์",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "เซนต์หลุยส์": [
    {
      "to": "ช่องนนทรี",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "สุรศักดิ์",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "สุรศักดิ์": [
    {
      "to": "เซนต์หลุยส์",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "สะพานตากสิน",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "สะพานตากสิน": [
    {
      "to": "สุรศักดิ์",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "กรุงธนบุรี",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "กรุงธนบุรี": [
    {
      "to": "สะพานตากสิน",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "วงเวียนใหญ่",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "วงเวียนใหญ่": [
    {
      "to": "กรุงธนบุรี",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "โพธิ์นิมิตร",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "โพธิ์นิมิตร": [
    {
      "to": "วงเวียนใหญ่",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "ตลาดพลู",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "ตลาดพลู": [
    {
      "to": "โพธิ์นิมิตร",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "วุฒากาศ",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "วุฒากาศ": [
    {
      "to": "ตลาดพลู",
      "time": 2,
      "mode": "BTS"
    },
    {
      "to": "บางหว้า",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "บางหว้า": [
    {
      "to": "วุฒากาศ",
      "time": 2,
      "mode": "BTS"
    }
  ],
  "ท่าพระ": [
    {
      "to": "จรัญฯ 13",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "จรัญฯ 13": [
    {
      "to": "ท่าพระ",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "ไฟฉาย",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "ไฟฉาย": [
    {
      "to": "จรัญฯ 13",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "บางขุนนท์",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "บางขุนนท์": [
    {
      "to": "ไฟฉาย",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "บางยี่ขัน",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "บางยี่ขัน": [
    {
      "to": "บางขุนนท์",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "สิรินธร",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "สิรินธร": [
    {
      "to": "บางยี่ขัน",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "บางพลัด",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "บางพลัด": [
    {
      "to": "สิรินธร",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "บางอ้อ",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "บางอ้อ": [
    {
      "to": "บางพลัด",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "บางโพ",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "บางโพ": [
    {
      "to": "บางอ้อ",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "เตาปูน",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "เตาปูน": [
    {
      "to": "บางโพ",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "บางซื่อ",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "บางซื่อ": [
    {
      "to": "เตาปูน",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "กำแพงเพชร",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "กำแพงเพชร": [
    {
      "to": "บางซื่อ",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "สวนจตุจักร",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "สวนจตุจักร": [
    {
      "to": "กำแพงเพชร",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "พหลโยธิน",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "หมอชิต",
      "time": 6,
      "mode": "เปลี่ยนสาย"
    }
  ],
  "พหลโยธิน": [
    {
      "to": "สวนจตุจักร",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "ลาดพร้าว",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "ลาดพร้าว": [
    {
      "to": "พหลโยธิน",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "รัชดาภิเษก",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "รัชดาภิเษก": [
    {
      "to": "ลาดพร้าว",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "สุทธิสาร",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "สุทธิสาร": [
    {
      "to": "รัชดาภิเษก",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "ห้วยขวาง",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "ห้วยขวาง": [
    {
      "to": "สุทธิสาร",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "ศูนย์วัฒนธรรมแห่งประเทศไทย",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "ศูนย์วัฒนธรรมแห่งประเทศไทย": [
    {
      "to": "ห้วยขวาง",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "พระราม 9",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "พระราม 9": [
    {
      "to": "ศูนย์วัฒนธรรมแห่งประเทศไทย",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "เพชรบุรี",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "เพชรบุรี": [
    {
      "to": "พระราม 9",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "สุขุมวิท",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "สุขุมวิท": [
    {
      "to": "เพชรบุรี",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "ศูนย์การประชุมแห่งชาติสิริกิติ์",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "อโศก",
      "time": 6,
      "mode": "เปลี่ยนสาย"
    }
  ],
  "ศูนย์การประชุมแห่งชาติสิริกิติ์": [
    {
      "to": "สุขุมวิท",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "คลองเตย",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "คลองเตย": [
    {
      "to": "ศูนย์การประชุมแห่งชาติสิริกิติ์",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "ลุมพินี",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "ลุมพินี": [
    {
      "to": "คลองเตย",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "สีลม",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "สีลม": [
    {
      "to": "ลุมพินี",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "สามย่าน",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "ศาลาแดง",
      "time": 6,
      "mode": "เปลี่ยนสาย"
    }
  ],
  "สามย่าน": [
    {
      "to": "สีลม",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "หัวลำโพง",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "หัวลำโพง": [
    {
      "to": "สามย่าน",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "วัดมังกร",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "วัดมังกร": [
    {
      "to": "หัวลำโพง",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "สามยอด",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "สามยอด": [
    {
      "to": "วัดมังกร",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "สนามไชย",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "สนามไชย": [
    {
      "to": "สามยอด",
      "time": 2.3,
      "mode": "MRT"
    },
    {
      "to": "อิสรภาพ",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "อิสรภาพ": [
    {
      "to": "สนามไชย",
      "time": 2.3,
      "mode": "MRT"
    }
  ],
  "ประตูน้ำ": [
    {
      "to": "อนุสาวรีย์ชัยสมรภูมิ",
      "time": 12,
      "mode": "รถเมล์ สาย 15"
    },
    {
      "to": "ราชดำริ",
      "time": 8,
      "mode": "รถเมล์ สาย 15"
    }
  ],
  "สนามหลวง": [
    {
      "to": "ราชดำริ",
      "time": 20,
      "mode": "รถเมล์ สาย 15"
    },
    {
      "to": "ท่าช้าง",
      "time": 5,
      "mode": "รถเมล์ สาย 15"
    }
  ],
  "ท่าช้าง": [
    {
      "to": "สนามหลวง",
      "time": 5,
      "mode": "รถเมล์ สาย 15"
    }
  ]
};

const POPULAR_ROUTES = [
  { from:"สยาม", to:"หมอชิต",  time:14, fare:43, img:"siam" },
  { from:"อโศก", to:"สยาม",   time:6,  fare:28, img:"asok" },
  { from:"อนุสาวรีย์ชัยสมรภูมิ", to:"พระราม 9", time:23, fare:60, img:"rama9" },
  { from:"อนุสาวรีย์ชัยสมรภูมิ", to:"สนามหลวง", time:28, fare:42, img:"sanamluang" }
];
/* every station name, flattened from the graph (used for validation) */
const ALL_STATIONS = Object.keys(TRANSIT_GRAPH);
