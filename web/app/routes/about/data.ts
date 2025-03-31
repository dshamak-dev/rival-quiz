import { APP_NAME } from 'src/constants/config.constants';

const appNameHTML = `<b>${APP_NAME.toUpperCase()}</b>`;

export const ABOUT_SECTIONS = [
	{
		title: `About ${APP_NAME.toUpperCase()}`,
		content: `Welcome to ${appNameHTML}, the ultimate platform for quiz & challenge lovers! Whether you enjoy testing your knowledge, challenging friends, or competing for real prizes, ${appNameHTML} is the perfect place to play, learn, and win.`,
	},
	{
		title: `Why Join and Play?`,
		content: `<ul>${[
			'Compete and Earn - Play quizzes and earn points that can be withdrawn as real money.',
			'Create and Share - Design your own quizzes and challenge others.',
			'Win Prizes - Participate in events to win free prizes and exclusive rewards.',
			'Real-Time Multiplayer - Join quiz rooms, compete against friends, and see who`s the smartest!',
		]
			.map((it) => `<li>${it}</li>`)
			.join('')}</ul>`,
	},
	{
		title: `Upcoming Features`,
		content: `<ul>${[
			'Live Tournaments - Compete in real-time events for massive rewards.',
			'Leaderboard & Rankings - Climb the global ranks and become a top quiz champion..',
			'Customizable Quiz Rooms - Set up private or public rooms with your own rules.',
			'More Games & Challenges - New ways to win beyond quizzes!',
		]
			.map((it) => `<li>${it}</li>`)
			.join('')}</ul>`,
	},
	{
		title: `More Info`,
		content: `${appNameHTML} is more than just a game; it's a thriving community where knowledge meets entertainment. Whether you're a casual player or a competitive mastermind, you'll find something exciting here. Start playing today and turn your knowledge into rewards!`,
	},
	{
		title: 'Timeline',
		content: `<p>In early June, we will launch the ${appNameHTML} Open Alfa. By participating now, earning Points, and inviting friends, you'll be ready for whatever comes next.</p></p>* Points are not a cryptocurrency and hold no monetary value outside the ${appNameHTML}, but can be pivotal for future perks or conversions.</p>`,
	},
];
