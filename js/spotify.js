// Authorization token that must have been created previously. See : https://developer.spotify.com/documentation/web-api/concepts/authorization
const token = 'BQAfLaDsrr0azH0VejyDN1-Pjq3DBJjkkfB4r6L0zC6MnCQmWtmdUpSsLMBY-pECBOfltvOKkmnj2d3moMbMechsn4va8vwSKANzeVi8cK9XzapRqGzSPZgu4LYK4jftmb8wrPbobTaGwC449p-tuixOrpgFl2A6VhoSnXgMoX6Rvp2ifbiKgaz1qoPon1IichCNPPYVm9CsHaM9GYhetxqj9_fBUkLRneQVAEvu8shm7X_utvGYpAdaXGxcMK8cdshEQoY-PZDkSQf-wQnO6exXJ2eQs2l0brY6GGGmAwk5n3eObUNbWT47cr79CLJG';
async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();
}

const tracksUri = [
  'spotify:track:4ZnkygoWLzcGbQYCm3lkae','spotify:track:7zSOMWwLEgV0MhtbTffsev','spotify:track:2egI1hFZDAYrkCgtepoore','spotify:track:15zPjWfZ6eUFMaL4aD5Gp8','spotify:track:3H4gp39BIC4t3guLhjJBZr'
];

async function createPlaylist(tracksUri){
  const { id: user_id } = await fetchWebApi('v1/me', 'GET')

  const playlist = await fetchWebApi(
    `v1/users/${user_id}/playlists`, 'POST', {
      "name": "My top tracks playlist",
      "description": "Playlist created by the tutorial on developer.spotify.com",
      "public": false
  })

  await fetchWebApi(
    `v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(',')}`,
    'POST'
  );

  return playlist;
}

const createdPlaylist = await createPlaylist(tracksUri);
console.log(createdPlaylist.name, createdPlaylist.id);

                     const playlistId = '2ZokRFXVUrpSYtlTAGgZD7';
