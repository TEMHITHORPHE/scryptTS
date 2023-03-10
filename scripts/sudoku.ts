
import { method, prop, SmartContract, assert, ByteString, toByteString, Utils, len, FixedArray, fill } from 'scrypt-ts'

export class Sudoku extends SmartContract {

  // bytes board;
  @prop()
  readonly board: ByteString;

  // static const int N = 9;
  static readonly N = 9;

  // static readonly board_square = Sudoku.N * Sudoku.N;
  static readonly board_square = 81;

  // constructor(bytes board) {
  //     this.board = board;
  // }
  constructor(board: ByteString) {
    super(board);
    this.board = board;
    // console.log("Constructor Ran: ", this.board);
  }



  // function merge(bytes solution) : bytes {
  //     bytes newBoard = this.board;

  //     loop (N) : i {
  //         loop (N) : j {
  //             int value = readValue(newBoard, i, j);
  //             int inputValue = readValue(solution, i, j);
  //             if (value == 0) {
  //                 require(inputValue <= 9);
  //                 newBoard = setValue(newBoard, i, j, inputValue);
  //             }
  //             else {
  //                 require(value == inputValue);
  //             }
  //         }
  //     }
  //     return newBoard;
  // }
  @method()
  merge(solution: ByteString): ByteString {
    let newBoard = this.board;

    for (let i = 0n; i < Sudoku.N; i++) {
      for (let j = 0n; j < Sudoku.N; j++) {

        const value: bigint = Sudoku.readValue(newBoard, i, j);
        const inputValue: bigint = Sudoku.readValue(solution, i, j);

        if (value == 0n) {
          assert(inputValue <= 9);
          newBoard = Sudoku.setValue(newBoard, i, j, inputValue);
        }
        else {
          assert(value == inputValue);
        }
      }
    }

    return newBoard;
  }



  //   public function solve(bytes solution) {
  @method()
  public solve(solution: ByteString) {

    //     require(len(solution) == Sudoku.N * Sudoku.N);
    assert(BigInt(len(solution)) == BigInt(Sudoku.N) * BigInt(Sudoku.N));

    //     bytes newBord = this.merge(solution);
    const newBoard = this.merge(solution);

    //     Array rowArray = new Array();
    //     Array colArray = new Array();
    //     Array squareArray = new Array();
    // let colArray: FixedArray<bigint, typeof Sudoku.board_square>;
    let rowArray = fill(0n, Sudoku.board_square);
    let colArray = fill(0n, Sudoku.board_square);
    let squareArray = fill(0n, Sudoku.board_square);
    

    //     loop (N) : i {
    for (let i = 0n; i < Sudoku.N; i++) {

      //         loop (N) : j {
      for (let j = 0n; j < Sudoku.N; j++) {
        const index = (i * j) % j;  // calculates actual index from relative indexes, since we're working with a flatlist.
        
        // check for duplicate

        //         in a row
        //         int rowElem = readValue(newBord, i, j);
        //         require(rowArray.indexOf(rowElem) == -1);
        //         rowArray.push(rowElem);
        const rowElem = Sudoku.readValue(newBoard, i, j);
        assert(this.findElementIndexInArray(rowArray, rowElem) == -1n);
        rowArray[Number(index)] = rowElem;


        //         // in a column
        //         int colElem = readValue(newBord, j, i);
        //         require(colArray.indexOf(colElem) == -1);
        //         colArray.push(colElem);
        const colElem = Sudoku.readValue(newBoard, j, i);
        assert(this.findElementIndexInArray(colArray, colElem) == -1n);
        colArray[Number(index)] = colElem;

        
        //         // in a subgrid
        //         int squareElem = readSquareValue(newBord, i, j);
        //         require(squareArray.indexOf(squareElem) == -1);
        //         squareArray.push(squareElem);
        const squareElem = Sudoku.readSquareValue(newBoard, i, j);
        assert(this.findElementIndexInArray(squareArray, squareElem) == -1n);
        squareArray[Number(index)] = rowElem;


        //     }
      }

      //     rowArray.clear();
      //     colArray.clear();
      //     squareArray.clear();

      // }
    }

    // require(true);
    assert(true);

    // }
  }



  //  Just remembered that `@method` cannot take such parameters.
  //  Well, seems the above statement was wrong.
  @method()
  findElementIndexInArray(array: FixedArray<bigint, number>, element: bigint) { //indexOf
    let found = -1n;
    let not_done = true;

    for (let index = 0; index < Sudoku.N; index++) {

      if (not_done) {
        if (element == array[index]) {
          not_done = false;
          found = BigInt(index);
        }
      }

    }
    return found;
  }



  // static function readValue(bytes board, int i, int j) : int {
  //     return Utils.fromLEUnsigned(ArrayUtil.getElemAt(board, Sudoku.index(i, j)));
  // }
  @method()
  static readValue(board: ByteString, i: bigint, j: bigint): bigint {
    const index = Sudoku.index(i, j);
    return Utils.fromLEUnsigned(board.slice(Number(index), Number(index) + 1));
  }



  // static function setValue(bytes board, int i, int j, int value) : bytes {
  //     return ArrayUtil.setElemAt(board, index(i, j), Utils.toLEUnsigned(value, 1));
  // }
  @method()
  static setValue(board: ByteString, i: bigint, j: bigint, value: bigint): ByteString {
    const index = Sudoku.index(i, j);
    const valueToSet = Utils.toLEUnsigned(value, 1n);

    // return b[: idx] + byteValue + b[idx + 1 :];
    return board.slice(0, Number(index)) + valueToSet + board.slice(Number(index) + 1);
  }



  // static function readSquareValue(bytes board, int i, int j) : int {
  //     return Utils.fromLEUnsigned(ArrayUtil.getElemAt(board, Sudoku.indexSquare(i, j)));
  // }
  @method()
  static readSquareValue(board: ByteString, i: bigint, j: bigint): bigint {
    const index = Number(Sudoku.indexSquare(i, j));
    return Utils.fromLEUnsigned(board.slice(index, index + 1));
  }



  // static function index(int row, int col) : int {
  //     return row * Sudoku.N + col;
  // }
  @method()
  static index(row: bigint, col: bigint): bigint {
    return row * BigInt(Sudoku.N) + col;
  }



  // static function indexSquare(int i, int j) : int {
  //     int row = i / 3 * 3 + j / 3;
  //     int col = i % 3 * 3 + j % 3;
  //     return Sudoku.index(row, col);
  // }
  @method()
  static indexSquare(i: bigint, j: bigint) {
    const row = i / 3n * 3n + j / 3n;
    const col = i % 3n * 3n + j % 3n;
    return Sudoku.index(row, col);
  }
}