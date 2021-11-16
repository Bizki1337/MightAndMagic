import { useState, useRef, useEffect } from 'react';

import Modal from './Components/Modal/Modal';

import './App.css';

function App() {
	const canvas = useRef(null);
	const canvasMini = useRef(null);
	const [state, setState] = useState([]);
	const [possibleMoves, setPossibleMoves] = useState(null);
	const [step, setStep] = useState(0);
	const [myStep, setMyStep] = useState(true);
	const [isPicked, setIsPicked] = useState(false);
	const [isShowAvailableMovesForVillian, setIsShowAvailableMovesForVillian] = useState(false);
	const [heroHealth, setHeroHealth] = useState(0);
	const [villainHealth, setVillainHealth] = useState(0);
	const [isGameFinished, setIsGameFinished] = useState(false);
	const [blocksPosition, setBlocksPosition] = useState(null);

	let hexHeight,
	hexRadius,
	hexRectangleHeight,
	hexRectangleWidth,
	hexagonAngle = 0.523598776, // 30 degrees in radians
	sideLength = 20,
	boardWidth = 10,
	boardHeight = 10;

	hexHeight = Math.sin(hexagonAngle) * sideLength;
	hexRadius = Math.cos(hexagonAngle) * sideLength;
	hexRectangleHeight = sideLength + 2 * hexHeight;
	hexRectangleWidth = 2 * hexRadius;

	useEffect(() => {
        drawBoard(boardWidth, boardHeight);
		drawMenu();
	}, [isGameFinished])

	useEffect(() => {
		const ctx = canvas.current.getContext("2d");
        let villain = findVillainPos();
		let hero = findHeroPos();
		if (villain.position) {
			drawHexagon(ctx, villain.position);
			drawHealth(ctx, villain.position)
		}
		if (hero.position) {
			drawHexagon(ctx, hero.position);
			drawHealth(ctx, hero.position)
		}
	}, [step])

	const drawBoard = (width, height) => {
		const ctx = canvas.current.getContext("2d");
		let i,
			j;
		let positions = [];
		const position = {}
		let id = 0;
		for(i = 0; i < width; ++i) {
			for(j = 0; j < height; ++j) {
				position.x = i * hexRectangleWidth + ((j % 2) * hexRadius);
				position.y = j * (sideLength + hexHeight);
				const pos = {
					id,
					x: Math.round(position.x),
					y: Math.round(position.y),
					type: 'land',
					color: 'white',
				}
				drawHexagon(ctx, pos);
				positions.push(pos)
				id += 1;
			}
		}
		const isHeroAlreadyOnBoard = findHeroPos();
		const isVillainAlreadyOnBoard = findVillainPos();

		if (!blocksPosition) {
			const maps = generateRandomBlocks();
			maps.forEach(item => {
				drawHexagon(
					ctx, 
					{
						x: positions[item].x,
						y: positions[item].y,
						type: 'block',
						color: 'black'
					}
				)
				positions[item].color = 'black';
				positions[item].type = 'block';
			})
		} else {
			blocksPosition.forEach(item => {
				drawHexagon(
					ctx, 
					{
						x: positions[item].x,
						y: positions[item].y,
						type: 'block',
						color: 'black'
					}
				)
				positions[item].color = 'black';
				positions[item].type = 'block';
			})
		}

		if (isHeroAlreadyOnBoard.position === undefined) {
			drawHexagon(
				ctx, 
				{
					x: 0,
					y: 120,
					type: 'hero',
					color: 'purple',
				}
			);
			positions[4].color = 'purple';
			positions[4].type = 'hero';
			positions[4].health = 500;
			positions[4].attackDamage = 100;
			positions[4].defenseDamage = 50;
			setHeroHealth(positions[4].health)
			drawHealth(ctx, positions[4])
		}
		if (isVillainAlreadyOnBoard.position === undefined) {
			drawHexagon(
				ctx, 
				{
					x: 312,
					y: 120,
					type: 'villain',
					color: 'green',
				}
			);
			positions[94].color = 'green';
			positions[94].type = 'villain';
			positions[94].health = 500;
			positions[94].attackDamage = 100;
			positions[94].defenseDamage = 50;
			setVillainHealth(positions[94].health)
			drawHealth(ctx, positions[94])
		}
		setState([...positions]);
	}
	
	function drawHexagon(canvasContext, position) {  
		const {x, y} = position;
		canvasContext.beginPath();
		canvasContext.moveTo(x + hexRadius, y);
		canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight);
		canvasContext.lineTo(x + hexRectangleWidth, y + hexHeight + sideLength);
		canvasContext.lineTo(x + hexRadius, y + hexRectangleHeight);
		canvasContext.lineTo(x, y + sideLength + hexHeight);
		canvasContext.lineTo(x, y + hexHeight);
		canvasContext.closePath();
		canvasContext.fillStyle = position.color;
		canvasContext.strokeStyle = 'black';
		canvasContext.fill();
		canvasContext.fillStyle = 'black';
		canvasContext.stroke();
	}

	const createUglyMoves = (canvasContext, position, id) => {
		const possibleMoves = [];
		let idMoves = findPossibleMovesId(id);
		const newState = [...state];
		idMoves.forEach(element => {
			if (state[element] && state[element].type === 'land') {
				let move = state[element];
				move.color = 'grey';
				move.type = 'possibleMove'
				newState[element] = move;
				possibleMoves.push(move);
			}
		});
		setState([...newState]);
		possibleMoves.forEach(element => {
			drawHexagon(canvasContext, element);
		});
		return possibleMoves;
	}

	const handleClick = (e) => {
			setStep(step+1);
			let x = e.clientX - canvas.current.offsetLeft;
			let y = e.clientY - canvas.current.offsetTop;
	
			let hexY = Math.floor(y / (hexHeight + sideLength));
			let hexX = Math.floor((x - (hexY % 2) * hexRadius) / hexRectangleWidth);
	
			let screenX =  Math.round(hexX * hexRectangleWidth + ((hexY % 2) * hexRadius));
			let screenY =  Math.round(hexY * (hexHeight + sideLength));
	
			const ctx = canvas.current.getContext("2d");
			ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
			drawBoard(boardWidth, boardHeight);
	
			let ClickedId, PrevId;
			const clickedPosition = state.find((item, i) => {
				ClickedId = i;
				return (item.x === screenX && item.y === screenY)
			});
			const prevPosition = state.find((item, i) => {
				PrevId = i;
				return (item.type === 'hero')
			});
			let villain = findVillainPos();
			let hero = findHeroPos();
			let isClickedOnPossibleMove;
			if (possibleMoves) {
				isClickedOnPossibleMove = possibleMoves.some(item => clickedPosition.x === item.x && clickedPosition.y === item.y);
			}
			if (clickedPosition.x === hero.position.x && clickedPosition.y ===  hero.position.y) {
				const newState = [...state];
				newState[ClickedId].color = '#ff59c8';
				newState[ClickedId].type = 'hero';
				setState([...newState]);
				// Check if the mouse's coords are on the board
				setIsPicked(true);
				setPossibleMoves(createUglyMoves(ctx, clickedPosition, ClickedId));
			} else {
				const newState = [...state];
				newState[PrevId].color = 'purple';
				newState[PrevId].type = 'hero';
				setIsPicked(false);
				if (!isClickedOnPossibleMove) {
					newState.map(item => {
						if (item.type === 'possibleMove') {
							item.type = 'land';
							item.color = 'white';
						}
						return item;
					})
				}
				setState([...newState]);
			}
			if (clickedPosition.x === villain.position.x && clickedPosition.y ===  villain.position.y && isPicked) {
				attackUnit(ClickedId, villain, hero);
				aiStep()
			}
	
			if (isClickedOnPossibleMove) {
				state.forEach(element => {
					if (clickedPosition.x === element.x && clickedPosition.y === element.y && element.type === 'possibleMove') {
						const newState = [...state];
						clickedPosition.color = 'purple';
						clickedPosition.type = 'hero';
						clickedPosition.health = prevPosition.health;
						clickedPosition.attackDamage = prevPosition.attackDamage;
						clickedPosition.defenseDamage = prevPosition.defenseDamage;
						delete prevPosition.health;
						delete prevPosition.attackDamage;
						delete prevPosition.defenseDamage;
						prevPosition.color = 'white';
						prevPosition.type = 'land';
						newState[ClickedId] = clickedPosition;
						newState[PrevId] = prevPosition;
						newState.map(item => {
							if (item.type === 'possibleMove') {
								item.type = 'land';
								item.color = 'white';
							}
							return item;
						})
						setState([...newState]);
						drawHexagon(ctx, clickedPosition);
						drawHexagon(ctx, prevPosition);
						setMyStep(!myStep);
						createCellsValues();
						aiStep();
					}
				});
			}
	}

	const findHeroPos = () => {
		let index;
		const pos = state.find((item, i) => {
			index = i;
			return item.type === 'hero';
		});
		return {position: pos, id: index};
	}

	const findVillainPos = () => {
		let index;
		const pos = state.find((item, i) => {
			index = i;
			return item.type === 'villain';
		});
		return {position: pos, id: index};
	}

	const drawHealth = (ctx, position) => {
		ctx.fillStyle = position.color;
		ctx.fillRect(position.x + 3, position.y + 40, 30, 20)
		ctx.fillStyle = 'white';
		ctx.font = "15px serif";
		ctx.fillText(String(position.health), position.x + 7, position.y + 55);
	}

	const attackUnit = (ClickedId, defensive, attacking) => {
		const newState = [...state];
		let attackMoves = findPossibleMovesId(attacking.id);
		attackMoves.forEach(element => {
			if (element === ClickedId && ClickedId === defensive.id) {
				newState[defensive.id].health = newState[defensive.id].health - newState[attacking.id].attackDamage;
				newState[attacking.id].health = newState[attacking.id].health - newState[defensive.id].defenseDamage;
			}
		});
		if (attacking.position.type === 'hero') {
			setHeroHealth(newState[attacking.id].health);
			setVillainHealth(newState[defensive.id].health);
		} else {
			setVillainHealth(newState[defensive.id].health)
			setHeroHealth(newState[attacking.id].health);
		}
		setState([...newState]);
		let newMessage = `${attacking.position.type} attacked ${defensive.position.type} for ${attacking.position.attackDamage}`
		console.log('newMessage',newMessage)
	}

	const findPossibleMovesId = (id) => {
		let idMoves;
		if (id % 2 === 0) {
			idMoves = [id-10,id+10, id-1, id+1, id-9, id-11];
		} else {
			idMoves = [id-1, id-10, id+1, id+9, id+10, id+11];
		}
		return idMoves;
	}

	const createCellsValues = () => {
		const newState = [...state];
		const hero = findHeroPos();
		let {id} = hero;
		let idPos = id;
		let cellValue = 90;
		for (idPos; idPos < newState.length; idPos += 10) {
			newState[idPos].value = cellValue;
			let someNumberForPlus = idPos % 10;
			let someNumberForMinus = idPos % 10;
			let cellValueForYPlus = cellValue;
			let cellValueForYMinus = cellValue;
			while (someNumberForPlus < 9) {
				someNumberForPlus++;
				let newStateIdValue = idPos - (idPos % 10) + someNumberForPlus;
				newState[newStateIdValue].value = cellValueForYPlus - 10
				cellValueForYPlus -= 10;
			}
			while (someNumberForMinus > 0) {
				someNumberForMinus--;
				let newStateIdValue = idPos - (idPos % 10) + someNumberForMinus;
				newState[newStateIdValue].value = cellValueForYMinus - 10;
				cellValueForYMinus -= 10;
			}
			cellValue -= 10;
		}
		idPos = id - 10;
		cellValue = 90;
		for (idPos; idPos > 0; idPos -= 10) {
			newState[idPos].value = cellValue;
			let someNumberForPlus = idPos % 10;
			let someNumberForMinus = idPos % 10;
			let cellValueForYPlus = cellValue;
			let cellValueForYMinus = cellValue;
			while (someNumberForPlus < 9) {
				someNumberForPlus++;
				let newStateIdValue = idPos - (idPos % 10) + someNumberForPlus;
				newState[newStateIdValue].value = cellValueForYPlus - 10
				cellValueForYPlus -= 10;
			}
			while (someNumberForMinus > 0) {
				someNumberForMinus--;
				let newStateIdValue = idPos - (idPos % 10) + someNumberForMinus;
				newState[newStateIdValue].value = cellValueForYMinus - 10;
				cellValueForYMinus -= 10;
			}
			cellValue -= 10;
		}
		setState([...newState]);
	}

	const aiStep = () => {
		const ctx = canvas.current.getContext("2d");
		ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
		drawBoard(boardWidth, boardHeight);
		const newState = [...state];
		let pos = findVillainPos();
		const hero = findHeroPos();
		let idMoves = findPossibleMovesId(pos.id);
		let prevIndex;
		let posExistPositions = []
		let prevPos = newState.find((item, i) => {
			prevIndex = i;
			return item.type === 'villain'
		});
		const posExist = [];
		idMoves.forEach(element => {
			if (state[element] && (state[element].type === 'land' || state[element].type === 'hero')) {
				posExist.push(element);
				posExistPositions.push(state[element])
			}
		});		
		const isCanAttack = posExist.some(item => item === hero.id);
		if (isCanAttack) {
			if (state[pos.id].health > 0) {
				attackUnit(hero.id, hero, pos);
			}
		} else {
			let maxValues = [];
			let valueArray = [];
			posExistPositions.forEach(el => {
				valueArray.push({
					id: el.id,
					value: el.value
				});
			})
			let max;
			valueArray.forEach((el, index) => {
				if (index === 0) {
					max = el;
				} else {
					if (max.value < el.value) {
						max = el;
					} else if (max.value === el.value) {
						maxValues.push(el);
					}
				}
			})
			maxValues.push(max);
			const random = Math.floor(Math.random() * maxValues.length);
			let newPosIndex = maxValues[random].id;
			newState[newPosIndex].color = 'green';
			newState[newPosIndex].type = 'villain';
			newState[newPosIndex].health = newState[prevIndex].health;
			newState[newPosIndex].attackDamage = newState[prevIndex].attackDamage;
			newState[newPosIndex].defenseDamage = newState[prevIndex].defenseDamage;
			newState[prevIndex].color = 'white';
			newState[prevIndex].type = 'land';
			delete newState[prevIndex].health;
			delete newState[prevIndex].attackDamage;
			delete newState[prevIndex].defenseDamage;
	
			if (isShowAvailableMovesForVillian) {
				const nextMoves = findPossibleMovesId(newPosIndex);
				nextMoves.forEach(element => {
					if (newState[element] && newState[element].type !== 'hero') {
						newState[element].color = '#560319';
						drawHexagon(ctx, newState[element]);
					}
				});
			}
		}
		setState([...newState]);
	}

	const generateRandomBlocks = () => {
		const maps = [
			[42, 52, 32, 23, 25, 36, 46, 56, 55, 53, 20, 60, 28, 19, 68, 69],
			[32, 42, 43, 54, 55, 65],
			[24, 34, 44, 54, 64, 74, 40, 41, 35, 45, 55, 46, 56, 47],
			[3, 5, 12, 22, 32, 42, 52, 62, 72, 82, 92, 16, 26, 36, 46, 56, 66, 76, 86, 96]
		]
		const someRandomNumber = Math.floor(Math.random() * maps.length);
		setBlocksPosition([...maps[someRandomNumber]])
		return maps[someRandomNumber];
	}

	const restartGame = () => {
		setHeroHealth(0);
		setVillainHealth(0);
		setState(null);
		setMyStep(!step);
		setIsGameFinished(!isGameFinished);
		setBlocksPosition(null);
		const ctx = canvas.current.getContext("2d");
		ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
		drawBoard(boardWidth, boardHeight);
	}

	// canvas mini
	const drawMenu = () => {
		const ctx = canvasMini.current.getContext("2d");
		ctx.clearRect(0, 0, canvasMini.current.width, canvasMini.current.height);
		drawHexagon(
			ctx, 
			{
				x: 5,
				y: 5,
				type: 'hero',
				color: 'purple',
			}
		);
		ctx.fillStyle = 'black';
		ctx.fillRect(50, 10, 45, 30)
		ctx.fillStyle = 'white';
		ctx.font = "15px serif";
		ctx.fillText('- hero', 55, 30);
		drawHexagon(
			ctx, 
			{
				x: 5,
				y: 45,
				type: 'villain',
				color: 'green',
			}
		);
		ctx.fillRect(50, 50, 55, 30);
		ctx.font = "15px serif";
		ctx.fillStyle = 'white';
		ctx.fillText('- villain', 55, 70);
		drawHexagon(
			ctx, 
			{
				x: 5,
				y: 85,
				type: 'villain',
				color: 'black',
			}
		);
		ctx.fillRect(50, 90, 55, 30);
		ctx.font = "15px serif";
		ctx.fillStyle = 'white';
		ctx.fillText('- block', 55, 110);
	}

	return (
		<div className="App">
			<canvas 
				ref={canvas}
				width={435} 
				height={310} 
				style={{margin: '15px'}}
				onClick={(e) => handleClick(e)}
			/>
			<div className='menu'>
				<button 
					onClick={() => setIsShowAvailableMovesForVillian(!isShowAvailableMovesForVillian)}
					className='button'
				>
					Show Available Moves For Villian:
				</button>
				<span className='menuItem'>{isShowAvailableMovesForVillian ? 'dont show' : 'show'}</span>
				<button onClick={() => restartGame()}>Restart Game</button>
				<div>
					<div>Hero Health: {heroHealth}</div>
					<div>Villain Health: {villainHealth}</div>
				</div>
				<canvas 
					ref={canvasMini}
					width={150} 
					height={150} 
					style={{margin: '15px'}}
				/>
			</div>
			{
				(heroHealth <= 0 || villainHealth <= 0) && (
					<Modal>
						<h1>some text</h1>
						<button onClick={() => restartGame()}>
							Restart Game
						</button>
					</Modal>
				)
			}
		</div>
	);
}

export default App;
