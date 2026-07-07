Added motion tokens in app/globals.css for fast, medium, slow, scene, ease, and ease-out timings.
Migrated reveal, orbit, and ring stroke-width motion to the shared timing variables.
Installed gsap 3.15.0 and imported it only in components/Ring.tsx.
Added a one-shot Ring intro: segments draw in, center text fades up, then the orbit dot fades in and starts.
Verified npm run build passes with the local Next font mock required by this no-network sandbox.
