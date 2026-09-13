const fs = require('fs');

// Fix projects/page.tsx
let p = fs.readFileSync('src/app/projects/page.tsx', 'utf8');
p = p.replace('</motion.div>\n            )}\n\n        </section>', '</motion.div>\n          )}\n\n        </section>');
p = p.replace('</ProjectRow>\n                )\n              )}\n\n            </motion.div>', '</ProjectRow>\n                )\n              )}\n\n            </motion.div>');
// Look at the earlier sed output:
//             <motion.div variants={containerVariants} initial="hidden" animate="show" className="projects-list">
//               {filteredProjects.map(...)}
//             </div>
//           )}
//         </section>
p = p.replace(/<\/div>\n\s*\)}/, '</motion.div>\n          )}');
fs.writeFileSync('src/app/projects/page.tsx', p);


// Fix projects/[id]/page.tsx
let id = fs.readFileSync('src/app/projects/[id]/page.tsx', 'utf8');
// For loading state
id = id.replace('            </motion.div>\n</div>\n</motion.div>\n</div>\n      </section>\n    </main>\n    );\n  }', '            </div>\n          </div>\n        </section>\n      </main>\n    );\n  }');
// For error state
id = id.replace('            </motion.div>\n</div>\n</motion.div>\n</div>\n      </section>\n    </main>\n    );\n  }\n\n  /* ====== DERIVED VALUES', '            </div>\n          </div>\n        </section>\n      </main>\n    );\n  }\n\n  /* ====== DERIVED VALUES');

// I might have completely mangled it. Let me just git checkout the original file and do it cleaner!
