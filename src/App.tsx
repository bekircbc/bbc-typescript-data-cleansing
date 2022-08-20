import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.scss';

const url =
	'https://edwardtanguay.netlify.app/share/techBooksUnstructured.json';

function App() {
	const [books, setBooks] = useState<IBook[]>([]);

	enum Status {
		hasError,
		noError,
		unknown,
	}

	interface IBook {
		id: number;
		title: string;
		description: string;
		language: string;
		yearMonth: string;
		numberInStock: number;
		status: Status;
	}

	const userIsAdmin = true;

	const getHasError = (
		rawBook: any,
		_language: string,
		_numberInStock: number | undefined
	): Status => {
		const idIsBad = typeof rawBook.id !== 'number';
		const descriptionIsBad = !rawBook.description;
		let numberInStockIsBad = !rawBook.numberInStock;
		if (_numberInStock === undefined) {
			numberInStockIsBad = true;
		}
		const titleIsBad = !rawBook.title;
		const yearMonthIsBad = !rawBook.yearMonth;
		const languageIsBad = !['english', 'french'].includes(_language);
		if (
			idIsBad ||
			descriptionIsBad ||
			languageIsBad ||
			numberInStockIsBad ||
			yearMonthIsBad ||
			titleIsBad
		) {
			return Status.hasError;
		} else {
			return Status.noError;
		}
	};

	useEffect(() => {
		(async () => {
			const rawBooks: any[] = (await axios.get(url)).data;

			const _books: IBook[] = [];
			rawBooks.forEach((rawBook: any) => {
				// language
				const _language = rawBook.language
					? rawBook.language
					: 'english';

				// numberInStock
				let _numberInStock: number | undefined = 0;
				if (typeof rawBook.numberInStock === 'string') {
					_numberInStock = Number(rawBook.numberInStock);
					if (Number.isNaN(_numberInStock)) {
						_numberInStock = undefined;
					}
				}

				const book: IBook = {
					id: rawBook.id,
					title: rawBook.title,
					description: rawBook.description,
					language: _language,
					yearMonth: rawBook.yearMonth,
					numberInStock: rawBook.numberInStock,
					status: getHasError(rawBook, _language, _numberInStock),
				};
				_books.push(book);
			});

			setBooks(_books);
		})();
	}, []);

	const bookIsAllowedToShow = (book: IBook) => {
		if (userIsAdmin) {
			return true;
		} else {
			if (book.status === Status.hasError) {
				return false;
			} else {
				return true;
			}
		}
	};

	const getClassesForBook = (book: IBook) => {
		if (userIsAdmin && book.status === Status.hasError) {
			return 'book error';
		} else {
			return 'book allowed';
		}
	};

	return (
		<div className="App">
			<h1>TypeScript Site Example</h1>
			<h2>There are {books.length} books.</h2>

			<div className="bookArea">
				{books.map((book, i) => {
					return (
						<>
							{bookIsAllowedToShow(book) && (
								<fieldset
									className={getClassesForBook(book)}
									key={i}
								>
									<legend>ID: {book.id}</legend>

									<div className="row">
										<label>Title</label>
										<div>{book.title}</div>
									</div>

									<div className="row">
										<label>Description</label>
										<div>{book.description}</div>
									</div>

									<div className="row">
										<label>Language</label>
										<div>{book.language}</div>
									</div>

									<div className="row">
										<label>Year/Month</label>
										<div>{book.yearMonth}</div>
									</div>

									<div className="row">
										<label>In Stock</label>
										<div>{book.numberInStock}</div>
									</div>
								</fieldset>
							)}
						</>
					);
				})}
			</div>
		</div>
	);
}

export default App;
