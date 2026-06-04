import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:4000/api/auctions/cmpxm184g000bnz01gmre73ls/live-bid', {
      amount: 1000
    });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Error status:", err.response.status);
      console.log("Error data:", err.response.data);
    } else {
      console.log("Error:", err.message);
    }
  }
}

test();
