
const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite = require("sqlite3");

const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

let database = null;

const initializeDbServer = async () => {
    try {
        database = await open({
            filename: databasePath,
            driver: sqlite3.Database
        });
        app.listen(30004, () => console.log("Server Running at http://localhost:3004/"));

    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};


initializeDbServer();


const convertMovieObjectInToResponseObject = (dbObject) => {
    return {
        movieId: dbObject.movie_id,
        directorId: dbObject.directer_id,
        movieName: dbObject.movie_name,
        leadActor: dbObject.lead_actor,
 };
};


const convertDirecterObjectInToResponseObject = (dbObject) => {
    return {
        directorId: dbObject.director_id,
        directorName: dbObject.director_name,
 };
};


app.get("/movies/:moviesId/", async (request, response) => {
    const getMoviesQuery = `
    SELECT 
        movie_name
    FROM
        movie;`;

   const moviesArray = await database.all(getMoviesQuery);
   response.send(
       moviesArray.map((eachMovie) => ({movieName: eachMovie.movie_name}))
   )
})

app.get("/movies/:movieId/", async(request, response) => {
    const {movieId} = request.params;

const getMovieQuery =`
        SELECT
            *
        FROM
            movie
        WHERE
            movie_id=${movieId};`;

     const movie = await database.get(getMovieQuery);
     response.send(convertMovieObjectInToResponseObject(movie));
});


app.post("/movies/", async(request, response) => {
    const {directorId, movieName, leadActor} = request.body;

    const postMovieQuery = `
    INSERT INTO
    movie (director_id, movie_name, lead_actor)
    VALUES
    (${directorId}, '${movieName}', '${leadActor}');`;

    await database.run(postMovieQuery);
    response.send("Movie Successfully Added");
});


app.put("/movies/:movieId/", async(request, response) => {
    const {directorId, movieName, leadActor} = request.body;
    const {movieId} = request.params;

    const updateMovieQuery = `
    UPDATE
    movie
    SET
    director_id=${directorId},
    movie_name=${movieName},
    lead_actor=${leadActor}
    WHERE
    movie_id=${movieId};`;

    await database.run(updateMovieQuery);
    response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async(request, response) => {
    const {movieId} = request.params;

    const deleteMovieQuery =`
    DELETE
    FROM
    movie
    WHERE movie_id=${movieId};`;

    await database.run(deleteMovieQuery);
    response.send("Movie Removed");
});


app.get("/directors/" async(request, response) => {
    const getDirectorsQuery = `
    SELECT
         *
    FROM
        director;`;
    
    const directorsArray = await database.all(getDirectorsQuery);
   
    response.send(
    directorsArray.map((eachDirector)=> 
    convertDirecterObjectInToResponseObject(directorsArray)
    )
    );
});

app.get("director/:directorId/movies" async(request, response) => {
    const {directorId} = request.params;

   const getDirectorsQuery = `
    SELECT
    movie_name
    FROM
    movie
    WHERE
    director_id=${directorId};`;

    const moviesArray = await database.all(getDirectorsQuery);
    response.send(
        moviesArray.map((eachMovie)=>({movieName: eachMovie.movie_name}))
    );
});

module.exports = app;
