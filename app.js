const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const db_path = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDataBaseAndServer = async () => {
  try {
    db = await open({
      filename: db_path,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDataBaseAndServer();

const convertSnakeToCamelCase = (value) => {
  return {
    movieName: value.movie_name,
  };
};

// API-1
app.get("/movies/", async (request, response) => {
  const movieNamesQuery = `
    SELECT movie_name FROM movie`;
  const movieNames = await db.all(movieNamesQuery);

  const convertSnakeToCamelCase = (value) => {
    return {
      movieName: value.movie_name,
    };
  };
  response.send(
    movieNames.map((eachMovie) => convertSnakeToCamelCase(eachMovie))
  );
});

//API-2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieQuery = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES('${directorId}', '${movieName}', '${leadActor}')`;
  await db.run(updateMovieQuery);
  response.send("Movie Successfully Added");
});

//API-3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT * FROM movie WHERE movie_id = '${movieId}'`;
  const movie = await db.get(getMovieQuery);
  const convertCamelToSnakeCase = (each) => {
    return {
      movieId: each.movie_id,
      directorId: each.director_id,
      movieName: each.movie_name,
      leadActor: each.lead_actor,
    };
  };
  response.send(convertCamelToSnakeCase(movie));
});

//API-4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE movie
  SET
  director_id = '${directorId}',
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  WHERE movie_id = '${movieId}'`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API-5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API-6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director`;
  const directors = await db.all(getDirectorsQuery);
  const convertSnakeToCamelCase = (each) => {
    return {
      directorId: each.director_id,
      directorName: each.director_name,
    };
  };
  response.send(directors.map((each) => convertSnakeToCamelCase(each)));
});

//API-7
app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT movie_name AS movieName FROM director NATURAL JOIN movie WHERE director_id = '${directorId}'`;
  const director = await db.all(getDirectorQuery);
  response.send(director);
});

module.exports = app;
