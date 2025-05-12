module.exports = {
	config: {
		name: "sura",
		version: "3",
		author: "yeasin",
		countDown: 5,
		role: 0,
		shortDescription: "read and listen quran",
		longDescription: "read and listen quran",
		category: "islamic",
		guide: "{pn} number"
	},

	onStart: async function({api, event, message, args }) {
	    const url_1 = require('url');
		const path = require('path');
		const cheerio = require("cheerio");
		const request = require('request');
		const util = require('util');
		const readline = require('readline');
		const axios = require('axios');
		const fs = require('fs').promises;
		const fss = require('fs');
		const fsExtra = require('fs-extra');
		const {
			getStreamFromURL,
			shortenURL,
			randomString
		} = global.utils;
	    const {
			resolve
		} = require('path');
	    api.setMessageReaction("⌛", event.messageID, (err) => {}, true);
	    let abc_float;
		let abc = parseFloat(args);
		if (Number.isInteger(abc)) {
		    abc_float = abc;
		} else {
		    abc_float = parseInt(abc.toFixed(0));
		}
		let sura_Text = "";
		const folderPath = resolve(__dirname, "cache");
		const file_path = __dirname + `/cache/${abc_float}.mp3`;
		let replyMessage;
		let intPart = parseInt(abc.toFixed(0));
		let decimalPart = parseInt(abc.toFixed(3).split('.')[1]);
		const typing = api.sendTypingIndicator(event.threadID);
		async function extractTextAsync(serial, decimalPart) {
			try {
				// Send an HTTP request to the website
				let url;
				let start_elements_texts;
				let sura_elements_texts;
				let paginationLinks;
				let audio_elements_texts;
				//console.log(serial);
				if (serial && !decimalPart) {
					// for full only আরবী সূরা ===>
					url = `https://www.hadithbd.com/quran/tilawat/detail/?sura=${serial}`;
					const response_first_url = await axios.get(url);
					const $ = cheerio.load(response_first_url.data);
					const links = $('.nav_button');
					const sura_elements = $('.box.ml-2.border-bottom.user-select-all');
					const start_elements = $('.card-header.shadow.h5.text-center.bg-info.text-white');
					start_elements_texts = [];
					sura_elements_texts = [];
					paginationLinks = [];
					links.each((index, element) => {
						const href = $(element).attr('onclick').match(/document.location.href='(.*)'/)[1];
						paginationLinks.push(href);
					});
					start_elements.each((index, element) => {
						start_elements_texts.push($(element).text().trim());
					});
					sura_elements.each((index, element) => {
						sura_elements_texts.push($(element).text().trim());
					});
					const next_url = paginationLinks[paginationLinks.length -1];
					if (next_url) {
						console.log(`👉 ${next_url} 👈`);						
						let parsedUrl = url_1.parse(next_url,
							true);
						let pageNum = parsedUrl.query.pageNum_alqurantilawat;
						let totalRows = parsedUrl.query.totalRows_alqurantilawat;
						let sura = parsedUrl.query.sura;
						let total_page = totalRows / 20;
						sura_elements_texts = [];
						for (let i = 0; i < total_page; i++) {
							let next_url = `https://www.hadithbd.com/quran/tilawat/detail/?pageNum_alqurantilawat=${i}&totalRows_alqurantilawat=${totalRows}&sura=${sura}`;
							//console.log(next_url);
							console.log(`👉 ${next_url} 👈`)
							let promises = [];
							promises.push(axios.get(next_url).then(response => {
								if (response.status === 200) {
									const $$$ = cheerio.load(response.data);
									//console.log($$$);
									let sura_loop_elements = $$$('.box.ml-2.border-bottom.user-select-all');
									//console.log(sura_loop_elements)
									//let bv = 0;
									sura_loop_elements.each((index, element) => {
										sura_elements_texts.push($(element).text().trim());
										//console.log(`${i} >> ${bv}`);
										//bv += 1;
									});
								}
								return null;
							}));
							await Promise.all(promises);
						}
						//console.log(sura_elements_texts);
					}
					// for full sura only অডিও==>
					let part0 = `https://www.hadithbd.com/quran/sura/recite/?sura=${serial}`;
					const response_audio = await axios.get(part0);
					const $$ = cheerio.load(response_audio.data);
					const audio_elements = $$('audio source');
					audio_elements_texts = [];
					audio_elements.each((index,
						element) => {
						audio_elements_texts.push($(element).attr('src').trim())
					});


					return {
						start_elements_texts,
						sura_elements_texts,
						audio_elements_texts
					}
				} else {
					if (serial && decimalPart) {
						//for only 1 line sura with আরবী+ বাংলা+ অডিও ===>
						let audioSourceLinks = "";
						let bnOnlyArrayValues = "";
						let suraArrayValues = "";
						let url_2 = `https://www.hadithbd.com/quran/tafsir/?sura=${serial}`;
						url = `https://www.hadithbd.com/quran/tilawat/detail/?sura=${serial}`;
						const response_first_url = await axios.get(url);
						const $ = cheerio.load(response_first_url.data);
						start_elements_texts = [];
						const start_elements = $('.card-header.shadow.h5.text-center.bg-info.text-white');
						start_elements.each((index, element) => {
							start_elements_texts.push($(element).text().trim());
						});
						const response_first_url_2 = await axios.get(url_2);
						const $$ = cheerio.load(response_first_url_2.data);
						const links = $$('.nav_button');
						paginationLinks = [];
						links.each((index, element) => {
							const href = $(element).attr('onclick').match(/document.location.href='(.*)'/)[1];
							paginationLinks.push(href);
						});

						if (decimalPart <= 10) {
							const element = $$('div.card.mb-3.shadow').get(decimalPart);
							const audioSource = $(element).find('audio source').attr('src');
							if (audioSource) {
								audioSourceLinks = audioSource;
							}
							const banglaValue = $(element).find('div.col-sm.alert.alert-secondary.my-2').find('p').first().text();
							const modifiedBanglaValue = banglaValue.replace('আল-বায়ান', '');
							//console.log(modifiedBanglaValue);
							if (modifiedBanglaValue) {
								bnOnlyArrayValues = modifiedBanglaValue;
							}
							const suraValue = $(element).find('div.col-sm.text-right.font-arabic.my-2.h2.showArabic').text().trim();
							const sura_remove_Value_1 = $(element).find('.badge.badge-pill.badge-info.ml-2.font-kalpurush-reading.clearfix').text().trim();
							const sura_remove_Value_2 = $(element).find('.sr-only').text().trim();
							const modifySuraValue = (suraValue.replace(sura_remove_Value_1, '')).replace(sura_remove_Value_2, '');
							if (modifySuraValue) {
								suraArrayValues = modifySuraValue;
							}
						} else {
							let next_url = paginationLinks[paginationLinks.length -1];						
							if (next_url) {
							    console.log(`👉 ${next_url} 👈`);
								let parsedUrl = url_1.parse(next_url,
									true);						
								let totalRows = parsedUrl.query.totalRows_tafsirquran;
								let num = decimalPart / 10; // 11 / 10 = 1.1
								let wholePart = Math.floor(num); // 1 round figure								//console.log(wholePart);
								let fractionPart = num - wholePart; // 1.1 - 1 = 0.1
								let roundedFractionPart = Math.round(fractionPart * 10); // (0.1 *10) with round figure 1
								if (roundedFractionPart === 0) {
									wholePart = wholePart - 1;
									roundedFractionPart = 10;
								}
								let pageNum = wholePart;
								next_url = `https://www.hadithbd.com/quran/tafsir/?pageNum_tafsirquran=${wholePart}&totalRows_tafsirquran=${totalRows}&sura=${serial}`;
								let response = await axios.get(next_url);
								if (response.status === 200) {
									const $$$ = cheerio.load(response.data);
									const element = $$$('div.card.mb-3.shadow').get(roundedFractionPart);
									const audioSource = $(element).find('audio source').attr('src');
									//console.log(audioSource);
									if (audioSource) {
										audioSourceLinks = audioSource;
									}
									const banglaValue = $(element).find('div.col-sm.alert.alert-secondary.my-2').find('p').first().text();
									const modifiedBanglaValue = banglaValue.replace('আল-বায়ান', '');
									//console.log(modifiedBanglaValue);
									if (modifiedBanglaValue) {
										bnOnlyArrayValues = modifiedBanglaValue;
									}
									const suraValue = $(element).find('div.col-sm.text-right.font-arabic.my-2.h2.showArabic').text().trim();
									const sura_remove_Value_1 = $(element).find('.badge.badge-pill.badge-info.ml-2.font-kalpurush-reading.clearfix').text().trim();
									const sura_remove_Value_2 = $(element).find('.sr-only').text().trim();
									const modifySuraValue = (suraValue.replace(sura_remove_Value_1, '')).replace(sura_remove_Value_2, '');
									//console.log(modifySuraValue);
									if (modifySuraValue) {
										suraArrayValues = modifySuraValue;
									}
								}
							}
						}
						return {
							start_elements_texts,
							audioSourceLinks,
							bnOnlyArrayValues,
							suraArrayValues
						}
					}
				}
			} catch (error) {
				console.error('Error:', error);
			}
		}
		async function checkPathExists(filePath) {
			try {
				await fss.promises.access(filePath,
					fss.constants.F_OK);
				return true;
			} catch (error) {
				console.log('🚫 The path does not exist 🚫');
				return false;
			}
		}
		async function splitMP3(filePath, fileSizeLimit, count, callback) {
			// Check if file exists
			if (!fss.existsSync(filePath)) {
				console.error(`Error: File '${filePath}' does not exist.`);
				return;
			}

			// Get file size
			const fileSize = fss.statSync(filePath).size;

			// Open the MP3 file in binary mode
			const readStream = fss.createReadStream(filePath);
			let partNumber = 0;
			let currentPart = fss.createWriteStream(`${filePath.split('.')[0]}.${partNumber}.mp3`); // Use base filename with part number

			readStream.on('data', (chunk) => {
				if (currentPart.bytesWritten + chunk.length > fileSizeLimit) {
					// Close and create a new part stream
					currentPart.close();
					partNumber++;
					currentPart = fss.createWriteStream(`${filePath.split('.')[0]}.${partNumber}.mp3`);
				}

				// Write chunk to the current part
				currentPart.write(chunk);
			});

			readStream.on('end',
				() => {
					currentPart.close();
					console.log(`MP3 file split into ${partNumber + 1} parts.`);
					callback(partNumber > 0);

				});

			readStream.on('error',
				(error) => {
					console.error('Error reading or writing file:', error);

				});
			
		}
		async function downloadAudio(audioUrl, count) {
			try {
				const {
					Readable
				} = require('stream');
				const audioPath = __dirname + `/cache/${count}.mp3`;
				const fileName = `${count}.mp3`;
				let audioBuffer;

				if (await checkPathExists(audioPath)) {
					console.log('File already exists. Skipping download.');
				} else {
					const audioData = await axios.get(audioUrl, {
						responseType: 'arraybuffer'
					});
					audioBuffer = audioData.data;
					fss.writeFileSync(audioPath, Buffer.from(audioBuffer));
					console.log(`Download complete. File saved to ${audioPath}`);
				}
				let splitSuccessful = false;
				const fileSizeLimit = 15 * 1024 * 1024; // 25 MB
				//const fileSize = fss.statSync(audioPath).size;
				let result;
                await new Promise((resolve, reject) => {
                    splitMP3(audioPath, fileSizeLimit, count, (result) => {
                        splitSuccessful = result;
                        resolve(); // Resolve the promise to indicate completion
                    });
                });

                return splitSuccessful;

			} catch (error) {
				console.error(`Error downloading audio: ${error}`);
			}
		}
		async function getGroupFiles(audioPath, keyword) {
			try {
				const files = await fs.readdir(path.dirname(audioPath));
				//console.log(files);
				const groupFiles = files.filter((file) => {
                    const fileName = file.split('/').pop(); // Get the file name without the directory path                   
                    return fileName.startsWith(keyword) && fileName.endsWith('.mp3') && fileName.slice(keyword.length + 1, -4).match(/\d+/) && fileName.slice(keyword.length + 1, -4) !== '10';
                });
				if (groupFiles.length === 0 || groupFiles.includes(audioPath)) {
					return [path.basename(audioPath)];
				}
				//console.log(`${groupFiles}`);
				return groupFiles;
			} catch (error) {
				console.error(error);
			}
		}
		
		if (decimalPart === 0) {
			extractTextAsync(abc_float).then((texts) => {
				let sura_elements_texts_array = texts.sura_elements_texts;
			    const start_elements_texts_array = texts.start_elements_texts;
				const audio_elements_texts_array = texts.audio_elements_texts;
				let audio_url = "";
				for (let i = 0; i < audio_elements_texts_array.length; i++) {
					let audio_find_url = audio_elements_texts_array[i].trim();
					const word = audio_find_url.split('/')[6];
					if (word === 'mishaari_raashid_al_3afaasee') {
						audio_url = audio_elements_texts_array[i].trim();
					}
				}
				if (audio_url.length !== 1) {
					audio_url = audio_elements_texts_array[1].trim();
				}
				downloadAudio(audio_url, abc_float)
				.then((audioData) => {
				    console.log("audioData", audioData);
				    if (audioData) {
					    const trimmedAfter = start_elements_texts_array[start_elements_texts_array.length - 1].trim();
					    let part1 = trimmedAfter.split(' | ')[0].trim();
						let part2 = trimmedAfter.split(' | ')[1].trim();
						let part3 = trimmedAfter.split(' | ')[2].trim();
						let part4 = part3.split(' - ')[2].trim();
						let part5 = part3.split('-')[1].trim();
						let part6 = part5.split('সংখ্যাঃ')[1].trim();
						let count = 0;
						let sura_Text = '';
						let otirikto = 0;
						getGroupFiles(file_path, abc_float)
					    .then((audioArray) => {
						    if (audioArray) {
						        const audioArrayPath = audioArray;
						        //console.log("অডিও", audioArrayPath);
							    let total_line_sms = "❏──❲ সূরা নম্বর: " + abc_float + " ❳───❏\n" + "❏──❲ " + part1 + " ❳───❏\n" + "❏──❲ " + part5 + " ❳───❏\n❏──❲ অবতীর্ণ: " + part4 + " ❳───❏\n";										
							    let body_arrange = "💗══❥ⵗⵗ̥̥̊̊ⵗ̥̥̥̥̊̊̊ⵗ̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̥̥̥̥̥̊̊̊ⵗ̥̥̥̥̥̥̥̥̥̥̊̊ⵗ̥̥̥̥̥̥̥̥̥̥̥ⵗ̥̥̥̥̥̥̥̥̥̥̊̊ⵗ̥̥̥̥̥̥̥̥̥̊̊̊ⵗ̥̥̥̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̊̊̊ⵗ̥̥̊̊══❥💗ـ" + "\n\n\n" + "╭────────────◊\n" + total_line_sms + "\n";									
							    let c = 0;
								typing();
								api.setMessageReaction("✔️", event.messageID, (err) => {}, true);
								try {
									for (let i = 0; i < sura_elements_texts_array.length; i++) {
										sura_Text += '\n' + sura_elements_texts_array[i];
										count++;
										if (count % 20 === 0) {
											otirikto += 20;
											let nombor;
										    if ((count - 20) === 0) {
											    nombor = ' শুরু';
										    } else {
										        nombor = (count - 20);
											}
											let sura_nombor = nombor + " নম্বর আয়াত থেকে " + count + " নম্বর আয়াত পর্য্যন্ত ";
											if (audioArrayPath[c]) {
											    const folderWithPath = resolve(__dirname, "cache", audioArrayPath[c]);
											    //console.log("folderWithPath ", folderWithPath);
												replyMessage = {
												    body: body_arrange + "\n" + sura_nombor + "\n╰───────────◊\n" + sura_Text,
												    attachment: fss.createReadStream(folderWithPath)
												}
												c += 1;
												api.sendMessage(replyMessage, event.threadID, () => fss.unlinkSync(folderWithPath), event.messageID);
										    } else {
										        //console.log("folderWithPath2 ");
											    replyMessage = {
												    body: body_arrange + "\n" + sura_nombor + "\n╰───────────◊\n" + sura_Text																
												}
												api.sendMessage(replyMessage, event.threadID, event.messageID);			
											}
																				
										    sura_Text = '';
										    sura_elements_texts_array.splice(0, 20);
											i = -1; // Reset the loop counter
										}															
									}
								} catch (error) {
									console.error(`${error}`);
								}
								if (sura_Text !== '') {
									let sura_nombor = (count - (count - otirikto)) + " নম্বর থেকে " + "শেষ পর্য্যন্ত ";
								    if (audioArrayPath.length === 1) {
									    const folderWithPath = resolve(__dirname, "cache", audioArrayPath[0]);
									    //console.log("folderWithPath3 ", folderWithPath);
										replyMessage = {
											body: body_arrange + "\n" + sura_nombor + "\n╰───────────◊\n" + sura_Text,
											attachment: fss.createReadStream(folderWithPath)
										}
										api.sendMessage(replyMessage, event.threadID, () => fss.unlinkSync(folderWithPath), event.messageID);
									} else {
									    //console.log("folderWithPath4 ");
										replyMessage = {
											body: body_arrange + "\n" + sura_nombor + "\n╰───────────◊\n" + sura_Text														
										}
									    api.sendMessage(replyMessage, event.threadID, event.messageID);
									}
								}
							}
						})
					}

				})
			    .catch((error) => {
					console.error(`Error downloading ${audio_url}: ${error}`);
		        });
			});
		} else {					
		    extractTextAsync(abc_float, decimalPart).then((texts) => {
			    const start_elements = texts.start_elements_texts;								
				const sura = texts.suraArrayValues;
			    const bangla = texts.bnOnlyArrayValues;
			    let audio_url = texts.audioSourceLinks;														
				const trimmedAfter = start_elements[start_elements.length - 1].trim();
			    let part1 = trimmedAfter.split(' | ')[0].trim();
				let part2 = trimmedAfter.split(' | ')[1].trim();
			    let part3 = trimmedAfter.split(' | ')[2].trim();
			    let part4 = part3.split(' - ')[2].trim();
				let part5 = part3.split('-')[1].trim();
				let part6 = part5.split('সংখ্যাঃ')[1].trim();
				api.setMessageReaction("✔️", event.messageID, (err) => {}, true);
			    let total_line_sms = "❏──❲ সূরা নম্বর: " + abc_float + " ❳───❏\n" + "❏──❲ " + part1 + " ❳───❏\n" + "❏──❲ " + part5 + " ❳───❏\n❏──❲ অবতীর্ণ: " + part4 + " ❳───❏\n";
				let sura_nombor = "❲" + abc_float + " নম্বর সূরার " + decimalPart + " নম্বর আয়াত দেওয়া হলো❳";
				let body_arrange = "❥͜͡𖠣꙰ٜٜٜٜٜٜٜٜٜ̋̀⚀ـٰٖٖٖٖٖٜ۬ـٰٰٖٖٖٖٜ۬ـٰٰٰٖٖٖٜ۬ـٰٰٰٰٖٖٜ۬ـٰٰٰٰٰٖٜ۬ 💗══❥ⵗⵗ̥̥̊̊ⵗ̥̥̥̥̊̊̊ⵗ̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̥̥̥̥̥̊̊̊ⵗ̥̥̥̥̥̥̥̥̥̥̊̊ⵗ̥̥̥̥̥̥̥̥̥̥̥ⵗ̥̥̥̥̥̥̥̥̥̥̊̊ⵗ̥̥̥̥̥̥̥̥̥̊̊̊ⵗ̥̥̥̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̥̊̊̊̊̊ⵗ̥̥̥̥̥̊̊̊̊ⵗ̥̥̥̥̊̊̊ⵗ̥̥̊̊══❥💗ـٰٖٖٖٖٖٜ۬ـٰٰٖٖٖٖٜ۬ـٰٰٰٖٖٖٜ۬ـٰٰٰٰٖٖٜ۬ـٰٰٰٰٰٖٜ۬⁜ٜٜٜٜٜٜٜٜٜ͜͡❥꙰" + "\n\n\n" + "╔══════════════════════╗\n" + total_line_sms + "\n" + sura_nombor;
				global.utils.getStreamFromURL(audio_url)
				.then(stream => {							
					replyMessage = {
						body: body_arrange + "\n╚══════════════════════╝\n" + sura + "\n" + bangla,
						attachment: stream
					}
					typing();
					api.sendMessage(replyMessage, event.threadID, event.messageID);
				});
			});
		}
	}
}
